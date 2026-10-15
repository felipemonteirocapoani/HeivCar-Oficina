name: Lembretes de serviço

on:
  schedule:
    # A cada hora, no minuto 0
    - cron: "0 * * * *"
  workflow_dispatch:   # permite rodar manualmente pela aba Actions

jobs:
  enviar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Instalar dependências
        run: npm install --no-save firebase-admin@12

      - name: Enviar lembretes das próximas 24 horas
        env:
          FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          DATABASE_URL: "https://heivcar-agenda-default-rtdb.firebaseio.com/"
        run: node scripts/lembretes.js
