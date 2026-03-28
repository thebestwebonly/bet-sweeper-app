# BET Sweeper – hromadný sweep a distribuce BET tokenů

Tato aplikace umožňuje:

- hromadně vybrat všechny BET tokeny z mnoha adres (např. 1000)
- hromadně rozeslat BET tokeny na mnoho adres
- používat Rabby (nebo jinou EVM peněženku) jako signer
- provádět hromadné operace **jedním podpisem** (po jednorázovém approve)

## Předpoklady

- BET je standardní ERC‑20 token
- uživatel má své adresy v Rabby / jiné peněžence
- všechny adresy, ze kterých se vybírá, udělí jednorázově `approve` na sweeper kontrakt

## Jak používat

### 1) Připojení peněženky

1. Otevři aplikaci v prohlížeči.
2. Klikni na „Připojit Rabby / peněženku“.
3. V Rabby potvrď připojení.

### 2) Nastavení tokenu a kontraktu

1. Do pole „Adresa BET tokenu“ vlož adresu BET tokenu.
2. Do pole „Adresa sweeper kontraktu“ vlož adresu nasazeného BetSweeper kontraktu.
3. Klikni na „Načíst info o tokenu“ – zobrazí se název, symbol a `decimals`.

### 3) Jednorázové approve (pro každou adresu)

Pro každou adresu, ze které chceš vybírat BET:

1. V Rabby přepni na danou adresu.
2. V aplikaci klikni na „Povolit práci s BET (approve)“.
3. Potvrď transakci v Rabby.

Toto stačí udělat **jednou za život** dané adresy.

### 4) Hromadný sweep (1 podpis)

1. Připoj v Rabby libovolnou „řídicí“ adresu (nemusí být žádná z těch 1000).
2. Do sekce „Hromadný sweep“ vlož seznam adres (každá na novém řádku).
3. Zadej cílovou adresu, kam se mají všechny BET poslat.
4. Klikni na „Vybrat všechny BET (1 podpis)“.
5. Potvrď transakci v Rabby.

Kontrakt:

- projde všechny adresy
- z každé, která má BET a approve, přesune zůstatek na cílovou adresu

### 5) Hromadná distribuce (1 podpis)

1. V Rabby přepni na adresu, ze které chceš posílat BET.
2. Do sekce „Hromadná distribuce“ vlož seznam cílových adres.
3. Zadej částku BET na jednu adresu v lidských jednotkách (např. `10` nebo `10.5`).
4. Klikni na „Rozeslat BET (1 podpis)“.
5. Potvrď transakci v Rabby.

Aplikace:

- převede částku do „raw“ jednotek podle `decimals`
- zavolá `distribute(source, token, wallets, amountPerWallet)`

### 6) Revoke (odvolání approve)

Kdykoli můžeš odvolat povolení:

1. V Rabby přepni na adresu, pro kterou chceš revoke.
2. V aplikaci klikni na „Odvolat povolení (revoke)“.
3. Potvrď transakci v Rabby.

Tím se zavolá `approve(sweeper, 0)` a kontrakt ztrácí právo pracovat s tvými BET.

## Bezpečnost

- aplikace nemá backend
- nic se neukládá na server
- všechny operace jsou on‑chain
- `robots.txt` a `<meta name="robots" content="noindex, nofollow">` blokují indexaci vyhledávači
- kód je transparentní a auditovatelný

## Poznámky

- pokud zadáš neplatné adresy, aplikace je ignoruje a vypíše varování v logu
- částky zadáváš v lidských jednotkách, aplikace je sama převede podle `decimals`
- aplikace je univerzální – můžeš ji použít i pro jiné ERC‑20 tokeny, nejen BET
