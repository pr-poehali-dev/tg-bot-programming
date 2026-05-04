"""Админ-панель: список донатов и пополнение баланса игрока."""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p46650649_tg_bot_programming")
ADMIN_SECRET = os.environ.get("TELEGRAM_ADMIN_CHAT_ID", "")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def check_auth(event: dict) -> bool:
    """Проверяем ключ из тела запроса (GET — из queryString, POST — из body)."""
    if not ADMIN_SECRET:
        return False
    # GET: ?key=...
    qs = event.get("queryStringParameters") or {}
    if qs.get("key") == ADMIN_SECRET:
        return True
    # POST: body.key
    try:
        body = json.loads(event.get("body") or "{}")
        if body.get("key") == ADMIN_SECRET:
            return True
    except Exception:
        pass
    return False


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if not check_auth(event):
        return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}

    method = event.get("httpMethod", "GET")
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()

    if method == "GET":
        cur.execute(
            f"SELECT id, username, amount, status, created_at FROM {SCHEMA}.donations ORDER BY created_at DESC LIMIT 50"
        )
        rows = cur.fetchall()
        donations = [
            {"id": r[0], "username": r[1], "amount": r[2], "status": r[3], "created_at": str(r[4])}
            for r in rows
        ]
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"donations": donations})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        action = body.get("action", "credit")

        if action == "credit":
            donation_id = int(body.get("donation_id", 0))
            coins = int(body.get("coins", 0))
            gems = int(body.get("gems", 0))

            cur.execute(f"SELECT username, status FROM {SCHEMA}.donations WHERE id = %s", (donation_id,))
            row = cur.fetchone()
            if not row:
                cur.close()
                conn.close()
                return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Донат не найден"})}

            username, status = row
            if status == "credited":
                cur.close()
                conn.close()
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Уже начислен"})}

            cur.execute(
                f"""INSERT INTO {SCHEMA}.player_balances (username, coins, gems)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (username) DO UPDATE
                    SET coins = player_balances.coins + %s,
                        gems  = player_balances.gems  + %s,
                        updated_at = NOW()""",
                (username, coins, gems, coins, gems),
            )
            cur.execute(
                f"UPDATE {SCHEMA}.donations SET status = 'credited' WHERE id = %s",
                (donation_id,),
            )
            conn.commit()
            cur.close()
            conn.close()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "username": username})}

    cur.close()
    conn.close()
    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
