# Ghid UX inspirat din Airbnb – 888 Rent a Car

Document de analiză UX, pattern-uri Airbnb și recomandări de implementare pentru site-ul de închirieri auto.

---

## 1. Principii UX folosite de Airbnb

### 1.1 Claritate
- **Un singur mesaj principal per ecran**: „Găsește un loc unde să stai” vs. „Rezervă o mașină”.
- **Limbaj simplu**: fără jargon („Preț final”, „fără costuri ascunse”).
- **Informații esențiale vizibile imediat**: preț, disponibilitate, locație.
- **Etichete explicite**: butoane cu acțiune clară („Caută”, „Rezervă”, „Verifică disponibilitatea”).

### 1.2 Ierarhie vizuală
- **Titlu H1** = scopul paginii (ex. „Închirieri Auto Cluj”).
- **Subtitluri / H2** = secțiuni („Mașini recomandate”, „De ce noi”).
- **Carduri / listă** = oferte (mașini) cu preț și CTA evident.
- **Footer / secundar** = linkuri legale, contact, trust (garanții, asigurări).

### 1.3 Flow de rezervare
- **Pas cu pas**: Locație + date → Rezultate → Detaliu mașină → Confirmare.
- **Persistență**: datele alese (pickup, return, locație) se păstrează în URL/state între pași.
- **Recap vizibil**: pe pagina de detaliu, un „Rezumat rezervare” (date + preț) mereu vizibil (sidebar sticky).
- **Un singur CTA principal** per ecran (ex. „Continua” / „Rezervă”).

### 1.4 Micro-interacțiuni
- **Hover pe carduri**: ușor shadow/scale sau border.
- **Focus vizibil** pe câmpuri (ring portocaliu).
- **Feedback la submit**: loading state pe buton, mesaj de succes.
- **Transiții scurte** (100–200 ms) la schimbare pagină / filtre.

### 1.5 Feedback pentru utilizator
- **Validare în timp real**: date invalide (return < pickup), câmpuri obligatorii.
- **Mesaje de eroare** lângă câmp, nu doar în top.
- **Confirmări**: „Rezervarea a fost trimisă”, „Date salvate”.
- **Stări de încărcare**: skeleton sau spinner pentru listă mașini / detaliu.

---

## 2. Structura paginilor cheie (Airbnb – aplicat la rent a car)

### 2.1 Homepage
- **Hero**: titlu + sublinieri (preț final, TVA, predare gratuită).
- **Widget căutare** prominent: locație + date pickup/return (ca „Unde / Când” Airbnb).
- **Secțiune „Recomandate”**: 3–6 mașini, carduri cu imagine + preț/zi + CTA.
- **Trust**: badge-uri scurte (TVA, RCA, 24/7, aeroport).
- **Secțiune „De ce noi”**: 3 puncte (preț, totul inclus, predare).
- **CTA final**: „Rezervă acum” / „Vezi toate mașinile”.
- **Footer**: linkuri, contact, social.

### 2.2 Pagina de căutare / listare rezultate
- **Filtre** (sidebar sau bară top): categorie, preț/zi, transmisie, combustibil.
- **Sortare**: preț crescător/descrescător, popularitate.
- **Listă/grid** de carduri: imagine, nume, preț/zi, 2–3 spec (an, motor, combustibil), buton „Vezi” / „Rezervă”.
- **Recap căutare** (opțional): „X mașini pentru [locație], [date]”.
- **Paginare sau „Încarcă mai multe”** dacă sunt multe rezultate.

### 2.3 Pagina unui anunț (detalii mașină)
- **Galerie imagini** (principală + thumbnails).
- **Coloană stânga**: nume, rating/review (dacă există), descriere, dotări, condiții.
- **Coloană dreaptă (sticky)**: **Rezumat rezervare** – date, locație, preț total, CTA „Rezervă” / „Continua”.
- **Trust**: garanție, SCDW, km incluși, anulare (scurt).
- **CTA secundar**: WhatsApp / Telefon.

### 2.4 Flow-ul de rezervare
- **Pas 1**: Alege mașina + date (pe homepage sau listare) → „Continua”.
- **Pas 2**: Detaliu mașină + confirmă date în sidebar → „Rezervă” / „Solicită ofertă”.
- **Pas 3** (opțional): Formular date personale (nume, email, telefon) + mesaj.
- **Pas 4**: Confirmare (pagina / email „Cererea a fost trimisă”).
- **Fără plată online** (dacă nu există): CTA = „Trimite cerere” / „Contactează-ne”.

---

## 3. Pattern-uri UI importante (Airbnb)

### 3.1 Layout
- **Grid**: 12 coloane; carduri 1/3 sau 1/4 pe desktop.
- **Spacing**: 8px grid (8, 16, 24, 32, 48, 64); secțiuni 48–64px vertical.
- **Carduri**: border radius 12px, shadow ușor, padding 16–24px; hover shadow mai pronunțat.
- **Container**: max-width ~1120–1280px, centrat, padding lateral 16–24px.

### 3.2 Tipografie
- **H1**: 28–36px, bold, gri foarte închis (#111).
- **H2**: 22–24px, semibold.
- **Body**: 16px, line-height 1.5–1.6, gri #333–#555.
- **Caption / secundar**: 14px, gri #666–#777.
- **Preț**: bold, mărime mărită, culoare accent (portocaliu).

### 3.3 Butoane și CTA-uri
- **Primar**: fundal accent (portocaliu), text alb, padding 12–16px, border-radius 8px.
- **Secundar**: outline (border accent), text accent; hover fill.
- **Text link**: accent, underline la hover.
- **Un CTA principal** per secțiune; restul secundare.

### 3.4 Culori și imagini
- **Accent**: un roșu/portocaliu pentru CTA și elemente importante (deja ai portocaliu).
- **Neutre**: gri pentru text și borduri; alb pentru carduri.
- **Imagini**: raport 4:3 sau 16:9, lazy load, placeholder până la încărcare; galerie cu thumbnails pe detaliu.

---

## 4. Structură UX adaptată pentru 888 Rent a Car (originală)

### 4.1 Wireframe logic (descris textual)

**Homepage**
1. Header: logo, nav (Mașini, Tarife, Condiții, Galerie, Contact), tel + WhatsApp.
2. Hero: H1 „Rent a Car Cluj – 24/7”, sublinieri (Preț final, TVA, Predare gratuită).
3. Bloc rezervare: card alb cu 4 câmpuri (Data preluare, Locație preluare, Data predare, Locație predare) + buton „Continua” + „Vezi toate mașinile”.
4. Secțiune dark: H2 „Cele mai închiriate”, 3 carduri mașini (imagine, nume, preț/zi, CTA).
5. Secțiune alb: H2 „De ce să ne alegi?”, 3 carduri (Preț final, Totul inclus, Predare gratuită).
6. Secțiune: H2 „888 Rent a Car”, text scurt + bloc „De pe blog” (lista articole).
7. Bandă CTA portocalie: „Livrare gratuită…”, butoane Rezervă / Condiții.
8. Footer: linkuri, newsletter, date firmă.

**Listare mașini** (`/inchirieri-masini-cluj`)
1. Header (ca pe homepage).
2. Secțiune intro: H1, text scurt, widget rezervare (variant compact).
3. Secțiune conținut: sidebar stânga „Filtre” (categorii); dreapta listă mașini pe categorii (H2 per categorie, grid carduri). Fiecare card: imagine, nume, preț/zi, spec, „Vezi” / „Rezervă”.

**Detaliu mașină** (`/inchirieri-masini-cluj/[slug]`)
1. Header.
2. Breadcrumb: Acasă / Mașini / [Nume mașină].
3. Layout 2 coloane:
   - Stânga: imagine principală (sau placeholder), nume, spec (an, motor, combustibil), descriere, dotări, condiții scurte.
   - Dreapta (sticky): card „Rezervă” cu widget rezervare (date + locații) + preț total (dacă se poate calcula) + buton „Continua” / „Rezervă”.
4. CTA: WhatsApp, Telefon.
5. Footer.

**Tarife**
1. Intro + formular rezervare (date + locații) pentru calcul.
2. Tabel prețuri (mașină, preț/zi, total N zile, garanție, SCDW, acțiuni).
3. Link „Condiții”.

**Contact**
1. Intro + date contact (email, telefon, adresă).
2. Formular: Nume, Email, Telefon, Mesaj + Trimite.
3. (Opțional) Widget rezervare compact.

### 4.2 Componente reutilizabile recomandate

| Componentă | Scop | Props principale |
|-----------|------|-------------------|
| **SearchBar / ReservationWidget** | Căutare date + locații (homepage, listare, detaliu) | variant (hero / compact / sidebar), defaultValues, onSubmit |
| **CarCard** | Card mașină în listă / grid | car, showCategory, size (default / compact) |
| **PriceSummary** | Preț total + breakdown (zi, zile, garanție) | days, pricePerDay, guarantee, optional SCDW |
| **TrustBadge** | TVA, RCA, 24/7, Aeroport | icon?, label |
| **SectionTitle** | H2 secțiune | children, light? (pentru fundal dark) |
| **StickySidebar** | Wrapper pentru rezumat rezervare pe detaliu | children |
| **Button** | CTA primar / secundar | variant, href?, onClick?, loading?, children |
| **Input**, **Select** | Câmpuri form cu stil unitar | label, error?, ...inputProps |
| **Toast / Alert** | Feedback succes/eroare | type, message, onClose |
| **SkeletonCard** | Loading state listă | - |

---

## 5. Îmbunătățiri conversie și ușurință (inspirate Airbnb)

### 5.1 Conversie
- **Preț vizibil peste tot**: pe card (preț/zi), pe detaliu (total estimat). „De la X €/zi” sau „X € total N zile”.
- **Un CTA principal**: „Rezervă” / „Continua” – același limbaj în tot flow-ul.
- **Reducere incertitudinii**: „Preț final, fără costuri ascunse”, „TVA, RCA, Casco incluse”, „Predare gratuită aeroport”.
- **Urgență blândă** (opțional): „Doar 2 mașini disponibile în perioada aleasă” (dacă ai disponibilitate reală).
- **WhatsApp vizibil**: buton fix sau în header pentru întrebări rapide.
- **Recap mereu vizibil** pe detaliu: utilizatorul vede mereu ce a ales (date, locație) și prețul.

### 5.2 Ușurință
- **Breadcrumbs** pe detaliu și listare.
- **Rezervare fără cont**: doar formular (nume, email, telefon) sau direct WhatsApp.
- **Persistență parametri**: URL cu ?pickup=...&return=...&loc=... ca pe Airbnb (deja ai parțial).
- **Validare date**: return ≥ pickup; mesaje clare lângă câmpuri.
- **Mobile-first**: butoane mari, câmpuri mari, sidebar rezervare devine bloc sub conținut pe mobil.
- **Accesibilitate**: focus vizibil, etichete pentru screen readers, contrast text (deja îmbunătățit).

### 5.3 Trust
- **Badge-uri** în hero și footer: TVA, RCA, Predare gratuită, 24/7.
- **Condiții** ușor de găsit (footer + pagină dedicată).
- **Contact vizibil**: telefon, email, WhatsApp.
- **Dacă există**: recenzii, parteneri, licențe (text scurt pe „Despre noi” sau footer).

---

## 6. Rezumat UX

- **Claritate**: un mesaj principal per ecran; preț și beneficii vizibile; limbaj simplu.
- **Ierarhie**: H1 → secțiuni (H2) → carduri/listă → CTA principal.
- **Flow**: Căutare (date + locație) → Listare → Detaliu (cu rezumat sticky) → Cerere rezervare / Contact.
- **Feedback**: validare în timp real, mesaje de eroare/succes, loading states.
- **Consistență**: aceleași componente (ReservationWidget, CarCard, butoane), aceleași spacing și culori.
- **Trust**: badge-uri, condiții, contact vizibil.

---

## 7. Do & Don't

### Do
- Păstra **un singur CTA principal** per secțiune (ex. „Continua”, „Rezervă”).
- Afișa **prețul** (per zi și/sau total) pe card și pe pagina de detaliu.
- Folosi **sticky sidebar** pe detaliu mașină pentru rezumat + formular rezervare.
- **Persista** datele căutării în URL (pickup, return, loc) între pagini.
- Valida **datele** (return ≥ pickup) și afișa erori lângă câmpuri.
- Oferi **feedback vizual** la submit (loading pe buton, mesaj succes).
- Folosi **placeholder / skeleton** la încărcarea listei sau a detaliului.
- Asigura **contrast** text (text închis pe fundal deschis) peste tot.
- Păstra **butonul WhatsApp** ușor accesibil (header sau flotant).
- Folosi **breadcrumbs** pe listare și detaliu.

### Don't
- Nu pune **multe CTA-uri** competitoare în același bloc (ex. 3 butoane de acțiune).
- Nu ascunde **prețul** sau condițiile până la final.
- Nu folosi **formulare lungi** fără pasi sau fără recap (ex. un singur form cu 15 câmpuri).
- Nu lăsa **eroarea** doar în top; afișează-o lângă câmpul problematic.
- Nu ignora **mobilul**: sidebar-ul rezervare trebuie accesibil sub conținut pe mic ecran.
- Nu folosi **text gri deschis pe alb**; păstrează gray-900 pentru text principal.
- Nu schimba **semantica** butoanelor (ex. „Continua” care duce la alt flow decât așteptat).

---

## 8. Recomandări de implementare (React / Next.js)

### 8.1 Structură și routing
- **App Router** (deja folosit): păstrează `page.tsx` per rută; `layout.tsx` pentru header/footer.
- **Server Components** pentru listă mașini, detaliu, tarife (date din JSON/DB); **Client Components** pentru formulare, filtre, sticky sidebar.
- **URL search params** pentru căutare: `?pickup=&return=&loc=`; citește în `page.tsx` și pasează la ReservationWidget / TarifeContent.

### 8.2 Componente
- **ReservationWidget**: deja există; poți extinde cu `defaultValues` din URL și cu callback `onSubmit` care face `router.push` cu query. Adaugă validare (return ≥ pickup) și `aria-invalid` + mesaj de eroare.
- **CarCard**: deja bun; poți adăuga variant `compact` pentru sidebar sau listă densă.
- **PriceSummary**: componentă nouă care primește `days`, `pricePerDay`, `guarantee`; afișează „X €/zi × N zile = Y €” + garanție; folosită în sidebar-ul de pe detaliu.
- **StickySidebar**: wrapper `className="lg:sticky lg:top-24"` cu rezumat + ReservationWidget pe detaliu mașină.
- **Butoane**: un component `Button` cu `variant="primary" | "outline" | "ghost"`, `loading`, `href` (Link) sau `onClick`.

### 8.3 State și date
- **Căutare**: citire din `searchParams` în Server Component; pentru precompletare în Client, folosește `useSearchParams()` și `useEffect` să seteze state-ul local.
- **Validare**: în ReservationWidget și TarifeContent, la submit verifică date; dacă invalid, `setError` pe câmp și nu face `router.push`.
- **Preț total pe detaliu**: calculează în client din `pickup`, `return`, `pricePerDay` (pasat ca prop); afișează în PriceSummary în sidebar.

### 8.4 Accesibilitate și performanță
- **Imagini**: `next/image` cu `sizes` și placeholder; lazy load pentru galerie.
- **Focus**: păstrează `focus:ring-2 focus:ring-primary` pe butoane și câmpuri.
- **Loading**: pe buton la submit: `disabled` + text „Se trimite…” sau spinner; pe listă/detaliu: `<Suspense>` cu fallback skeleton.
- **Erori**: legătură `aria-describedby` între input și mesajul de eroare; `aria-invalid="true"` când câmpul e invalid.

### 8.5 Pași prioritari
1. **Validare** în ReservationWidget (return ≥ pickup) + mesaje de eroare.
2. **PriceSummary** în sidebar-ul de pe detaliu mașină (cu date din URL).
3. **Sticky** pentru sidebar rezervare pe detaliu (doar desktop; pe mobil sub conținut).
4. **Un component Button** reutilizabil cu loading state.
5. **Skeleton** pentru listă mașini (opțional) în `Suspense` fallback.
6. **Toast/Alert** pentru „Cerere trimisă” după formular contact sau rezervare.

---

*Document creat pentru 888 Rent a Car. Poate fi folosit ca bază pentru refactorizare UX și implementare în Next.js.*
