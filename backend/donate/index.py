"""Принять донат: сохраняет заявку в БД и отправляет уведомление админу в Telegram."""
import json
import os
import psycopg2
import urllib.request

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p46650649_tg_bot_programming")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def send_telegram(text: str):
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.environ.get("TELEGRAM_ADMIN_CHAT_ID", "")
    if not token or not chat_id:
        return
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = json.dumps({"chat_id": chat_id, "text": text, "parse_mode": "HTML"}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = json.loads(event.get("body") or "{}")
    username = str(body.get("username", "")).strip() or "Аноним"
    amount = int(body.get("amount", 0))

    if amount < 1:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Сумма должна быть больше 0"})}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {SCHEMA}.donations (username, amount, status) VALUES (%s, %s, 'pending') RETURNING id",
        (username, amount),
    )
    donation_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    msg = (
        f"💰 <b>Новый донат!</b>\n\n"
        f"👤 Игрок: <b>{username}</b>\n"
        f"💵 Сумма: <b>{amount} ₽</b>\n"
        f"🆔 ID заявки: <code>{donation_id}</code>\n\n"
        f"✅ Пополни баланс игроку в разделе «Донаты» на сайте."
    )
    send_telegram(msg)

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"ok": True, "donation_id": donation_id}),
    }
