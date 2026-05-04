"""Получить баланс игрока по username."""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p46650649_tg_bot_programming")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    qs = event.get("queryStringParameters") or {}
    username = (qs.get("username") or "").strip()

    if not username:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "username required"})}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        f"SELECT coins, gems FROM {SCHEMA}.player_balances WHERE username = %s",
        (username,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if row:
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"coins": row[0], "gems": row[1]})}
    else:
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"coins": 0, "gems": 0})}
