
```bash
stripe listen --forward-to http://localhost:3001/api/stripe/webhook

docker compose run --rm licensing-server npm run seed:products
```
