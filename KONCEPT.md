# Vattenresan – koncept, testplan och testresultat

## Koncept

- **Mål (en sak):** eleven ska kunna följa en droppe vatten ett helt varv genom vattnets
  kretslopp och välja rätt nästa steg, med rätt begrepp.
- **Målgrupp:** åk 4–6 (9–11 år), kemi, iPad först.
- **Kärnmekanik (touch först):** scenen visar sjö, skogsbacke och stad. Droppen står på rätt
  plats i bilden; under bilden står en fråga om vad som händer härnäst och tre stora
  svarsplattor. Rätt val → droppen glider till nästa plats (luft, moln, mark, gata, brunn, sjö)
  längs en båge, förklaringen skrivs ut och läses upp. Fel val → inget går förlorat.
- **5-minuterssession:** tre nivåer med sex steg, "Nästa nivå" och "Spela igen".
- **Belöning barnet kan berätta om:** stjärnor (steg som löstes på första försöket, 0–6 per
  nivå) och "Alla nivåer klara" – sjön, staden och vintern.
- **Vad barnet lär:** avdunstning → kondensering → nederbörd, och att vattnet tar olika väg hem:
  infiltration och grundvatten genom porös mark, avrinning och dagvatten över asfalt, tjäle som
  gör vårfloden till avrinning, samt solens energi som kretsloppets motor.
- **Varför det funkar på iPad:** ingen textinmatning, tre plattor om 62–76 px höjd, hela spelet
  i en enda skärmbild utan scroll.

## Lgr22 (citat hämtat ur get_curriculum, inte ur huvudet)

- **KE.4-6.1.3** – ”Vattnets egenskaper och kretslopp.”
  (Skolverket, Syllabus API, hämtad 2026-11-23 – samma text används i index.html och i
  katalogens long_description.)

## Testplan (satt före koden)

1. `node verify.cjs` = 0 fel: 18 steg, tre alternativ med unika texter, rätt index 0–2,
   svarstexten aldrig i frågan, alla scenpunkter inom viewBoxen, alla nivåer slutar i sjön,
   20 000 rundor genom appens eget reaktionsschema utan häng.
2. Scrollfri i 1024×768, 768×1024, 390×844, 1440×900 och 1200×900, både startskärm och spel.
3. Hela rundan med äkta touch (`Input.dispatchTouchEvent`), lokalt och på driftsatt URL.
4. Tryckytor ≥56 px i höjd (3–6-banden enligt childrens-game-design).
5. Inga konton, inga cookies, inga utgående länkar utöver kodsnutten; rapporterar round_start,
   round_done, level, hint, sound_off via `window.skolappar.event`.
6. Frågan och förklaringen finns alltid som text, inte bara som tal (tysta klassrumsplattor).

## Självkritik före bygge

`delegate_task` finns inte i den här sessionens verktygsuppsättning, så den andra agentens
go/no-go gjordes som en skriven genomgång i stället:

- **(a) Spelar ett barn 5 minuter frivilligt?** Ja om miljöerna känns olika. Staden och vintern
  har egna frågor (asfalt, dagvatten, tjäle, solens energi), inte samma frågor i ny färg.
- **(b) Träffar det ett verkligt kunskapskrav?** Ja: KE.4-6.1.3, som saknades helt i katalogen.
- **(c) Teknisk risk?** Låg: en SVG-scen och vanliga knappar, ingen fysik eller spelmotor.
  Största risken var layout i stående läge – mätt, se nedan.

## Testresultat (kört 2026-11-25)

- `node verify.cjs`: **OK – 20 275 kontroller, 0 fel**, 20 000 simulerade rundor, stjärnor 0–6.
- **Buggen som bara äkta touch hittade:** `#startskarm` dolde sig aldrig när spelet startade.
  Den låg kvar som `position: fixed` över spelplanen och svalde varje tryck – åtta touch-tryck
  gav `steg: 0` medan DOM, mått och `check_app` såg perfekta ut. Rättad
  (`startskarm.hidden = true` i `startaNiva`) och omtestad: nivå 1 gick då 6/6.
- **Nivå 1 spelad med äkta touch** lokalt (1024×768) och på driftsatt URL: 6 frågor,
  "Nivå 1 klar – 6 av 6 stjärnor".
- **Nivå 2 och 3 genomspelade** till "Alla nivåer klara!" (6/6 i varje).
- **Felvägen prövad:** ett fel gav en varsam text och flyttade ingenting; två fel lyste rätt
  platta med puls och förklaring, och frågan gick att lämna utan förlust (0 stjärnor för det
  steget).
- **Scroll:** 0 px i båda riktningarna på startskärm och i spel i 1024×768, 768×1024, 390×844,
  1440×900 och 1200×900. Inget element utanför viewporten i något av lägena.
- **Tryckytor:** svarsplattor 323×76 px (iPad liggande), 748×62 px (iPad stående), 370×62 px
  (390 px telefon), 461×76 px (desktop); ljudknapp 48×48 px. Minsta yta 62 px > 56 px-kravet.
- `check_app` på https://vattenresan.skolappar.com: **15/15, 0 warnings** (381 ms).
- **Kortbild:** `public/kort.png`, 1200×900, spelmoment ur nivå 1 utan overlay. Uppladdad till
  katalogen som `/images/d5a36892c32b9dc4f186f5e163f15b0c.png` (200, sparad kopia 1200×900).
  Bilden granskades programmatiskt (4 513 distinkta färger, solläge, moln, havsblått och
  svarsplattor i förväntade regioner) eftersom något bildseende verktyg inte finns i sessionen.

## Avvikelser att känna till

- Katalograden skapades med `status: "pending"` (både vid `create_app` och `update_app`) men
  katalogen satte den till `approved` direkt. Appen är alltså redan synlig; den är spelad och
  `check_app`-godkänd innan dess.
- En `git push` hamnade först i fel repo (sorteralabbet) eftersom ett annat projekts remote-URL
  återanvändes. Sorteralabbets träd återställdes (`git merge -s ours`, e701b2a, träd identiskt
  med 8d4a09d) och vattenresan ligger nu i ett eget repo, `magnusfroste/vattenresan`.