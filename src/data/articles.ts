import type { Locale } from "@/i18n/config";

export interface Article {
  id: string;
  slug: string;
  date: string;
  image: string;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  content: Record<Locale, string>;
}

export const articles: Article[] = [
  {
    id: "1",
    slug: "de-ce-sa-alegi-masina-4x4-iarna-cluj",
    date: "2026-01-08",
    image: "/images/cars/ford-kuga-automat-7.jpg",
    title: {
      ro: "De ce să alegi o mașină de închiriat 4x4 pe timp de iarna în Cluj-Napoca?",
      en: "Why choose a 4x4 rental car in winter in Cluj-Napoca?",
    },
    excerpt: {
      ro: "Fie că ai drumuri în afara orașului sau vrei pur și simplu mai multă încredere la volan, o mașină cu tracțiune integrală poate face diferența în sezonul rece.",
      en: "Whether you are driving out of town or just want more confidence behind the wheel, an all-wheel-drive car can make the difference in the cold season.",
    },
    content: {
      ro: `
      <p>Iarna în Cluj-Napoca și în Transilvania poate aduce zăpadă și gheață. O mașină 4x4 închiriată de la TRT Rent a Car îți oferă siguranță și control în condiții dificile.</p>
      <p>Beneficii:</p>
      <ul>
        <li>Tracțiune integrală pe zăpadă și gheață</li>
        <li>Încredere pe drumuri de munte</li>
        <li>Modele SUV: Ford Kuga Automat, BMW X1 Automat</li>
      </ul>
      <p>Rezervă-ți mașina 4x4 cu un click și bucură-te de iarnă în siguranță.</p>
    `,
      en: `
      <p>Winter in Cluj-Napoca and Transylvania can bring snow and ice. A 4x4 rented from TRT Rent a Car gives you safety and control in difficult conditions.</p>
      <p>Benefits:</p>
      <ul>
        <li>All-wheel drive on snow and ice</li>
        <li>Confidence on mountain roads</li>
        <li>SUV models: Ford Kuga Automatic, BMW X1 Automatic</li>
      </ul>
      <p>Book your 4x4 in one click and enjoy winter safely.</p>
    `,
    },
  },
  {
    id: "2",
    slug: "masini-inchiriat-sarbatori",
    date: "2025-12-05",
    image: "/images/cars/ford-puma-automat-1.jpg",
    title: {
      ro: "Ce mașini de închiriat sunt potrivite pentru perioada sărbătorilor?",
      en: "Which rental cars are best for the holiday season?",
    },
    excerpt: {
      ro: "Perioada sărbătorilor vine cu drumuri mai multe. Alegerea mașinii potrivite ține de confort, spațiu și siguranță.",
      en: "The holidays mean more trips. Choosing the right car comes down to comfort, space and safety.",
    },
    content: {
      ro: `
      <p>În sărbători, fie că mergi la familie, la munte sau rămâi în oraș, ai nevoie de o mașină fiabilă și spațioasă.</p>
      <p>Recomandări TRT Rent a Car:</p>
      <ul>
        <li>Familie: Ford Kuga Automat, BMW X1 Automat</li>
        <li>Confort: Hyundai Elantra, Ford Puma Automat</li>
        <li>Economic: Renault Clio, Ford Fiesta</li>
      </ul>
      <p>Rezervările se fac online sau prin WhatsApp. Predare și preluare gratuită la Aeroport Cluj.</p>
    `,
      en: `
      <p>During the holidays, whether you visit family, go to the mountains or stay in the city, you need a reliable and spacious car.</p>
      <p>TRT Rent a Car recommendations:</p>
      <ul>
        <li>Family: Ford Kuga Automatic, BMW X1 Automatic</li>
        <li>Comfort: Hyundai Elantra, Ford Puma Automatic</li>
        <li>Economy: Renault Clio, Ford Fiesta</li>
      </ul>
      <p>Book online or via WhatsApp. Free pick-up and drop-off at Cluj Airport.</p>
    `,
    },
  },
  {
    id: "3",
    slug: "rent-a-car-cluj-de-ce-888",
    date: "2025-11-05",
    image: "/images/cars/logo-header.jpg",
    title: {
      ro: "Rent a Car Cluj – De ce tot mai mulți șoferi aleg TRT Rent a Car",
      en: "Car rental Cluj – Why more drivers choose TRT Rent a Car",
    },
    excerpt: {
      ro: "Servicii de închirieri auto Cluj la standarde profesionale: flotă variată, prețuri transparente, predare gratuită la aeroport.",
      en: "Professional car rental in Cluj: varied fleet, transparent prices, free airport delivery.",
    },
    content: {
      ro: `
      <p>TRT Rent a Car oferă închirieri auto Cluj Napoca și la Aeroportul Internațional Cluj. Preț afișat = preț final, fără taxe ascunse.</p>
      <p>Avantaje:</p>
      <ul>
        <li>Predare și preluare gratuită la sediu și aeroport</li>
        <li>TVA, RCA, Casco, anvelope de iarnă incluse</li>
        <li>Fără avans la rezervare (în condiții normale)</li>
        <li>Rezervare rapidă prin site sau WhatsApp</li>
      </ul>
      <p>Contact: rezervari@trtrentacar.ro sau WhatsApp.</p>
    `,
      en: `
      <p>TRT Rent a Car offers car rental in Cluj Napoca and at Cluj International Airport. Displayed price = final price, no hidden fees.</p>
      <p>Advantages:</p>
      <ul>
        <li>Free pick-up and drop-off at the office and airport</li>
        <li>VAT, RCA, Casco and winter tyres included</li>
        <li>No prepayment to book (under normal conditions)</li>
        <li>Fast booking via the website or WhatsApp</li>
      </ul>
      <p>Contact: rezervari@trtrentacar.ro or WhatsApp.</p>
    `,
    },
  },
  {
    id: "4",
    slug: "intrebari-frecvente-despre-serviciile-de-rent-a-car-in-cluj-napoca",
    date: "2024-04-06",
    image: "/images/blog/cluj-napoca-01.jpg",
    title: {
      ro: "Întrebări frecvente despre serviciile de rent a car în Cluj-Napoca: tot ce trebuie să știi",
      en: "Frequently asked questions about car rental in Cluj-Napoca: everything you need to know",
    },
    excerpt: {
      ro: "Închirierea unei mașini poate fi soluția ideală pentru vacanță, o călătorie de afaceri sau un vehicul temporar. Am adunat cele mai frecvente întrebări de la clienții din Cluj-Napoca.",
      en: "Renting a car can be the right choice for a holiday, a business trip or a temporary vehicle. Here are the questions we hear most often from customers in Cluj-Napoca.",
    },
    content: {
      ro: `
      <p>Închirierea unei mașini poate fi o soluție ideală pentru călătoriile tale, fie că ești în vacanță, într-o călătorie de afaceri sau pur și simplu ai nevoie de un vehicul temporar. Dacă te afli în Cluj-Napoca și cauți un serviciu de rent a car, acest ghid este pentru tine. Am adunat cele mai frecvente întrebări pe care le primim de la clienții noștri pentru a-ți oferi toate informațiile necesare.</p>
      <h2>1. De ce să alegi TRT Rent a Car în Cluj-Napoca?</h2>
      <p>La TRT Rent a Car, punem accent pe calitate, profesionalism și satisfacția clientului. Oferim o gamă variată de mașini bine întreținute, de la autoturisme economice la SUV-uri și mașini de lux. De asemenea, ne mândrim cu un serviciu clienți excelent și tarife competitive.</p>
      <h2>2. Ce documente sunt necesare pentru a închiria o mașină?</h2>
      <p>Pentru a închiria o mașină de la TRT Rent a Car, vei avea nevoie de:</p>
      <ul>
        <li>Un permis de conducere valabil (național sau internațional).</li>
        <li>Un act de identitate (carte de identitate sau pașaport).</li>
        <li>Un card de credit pe numele tău pentru a garanta închirierea și a acoperi eventualele daune.</li>
      </ul>
      <h2>3. Care este vârsta minimă pentru a închiria o mașină?</h2>
      <p>Vârsta minimă pentru a închiria o mașină la TRT Rent a Car este de 21 de ani, iar șoferul trebuie să dețină un permis de conducere valabil de cel puțin un an. Pentru anumite categorii de vehicule, vârsta minimă poate fi mai mare.</p>
      <h2>4. Ce este inclus în prețul de închiriere?</h2>
      <p>Prețul de închiriere include:</p>
      <ul>
        <li>Utilizarea vehiculului pe durata convenită.</li>
        <li>Asigurare de bază (RCA).</li>
        <li>Kilometri nelimitați pentru anumite categorii de închirieri.</li>
        <li>Asistență rutieră 24/7.</li>
      </ul>
      <p>Opțiuni suplimentare, cum ar fi asigurarea full casco, GPS, scaun pentru copii sau șofer suplimentar, pot fi adăugate contra cost.</p>
      <h2>5. Cum se face rezervarea?</h2>
      <p>Poți rezerva o mașină online, prin intermediul site-ului nostru, sau telefonic. Îți recomandăm să faci rezervarea cât mai devreme posibil pentru a te asigura că vei găsi vehiculul dorit disponibil.</p>
      <h2>6. Care sunt condițiile de anulare a rezervării?</h2>
      <p>Politica noastră de anulare permite anularea gratuită a rezervării cu cel puțin 48 de ore înainte de data preluării mașinii. În caz de anulare cu mai puțin de 48 de ore înainte, se poate percepe o taxă de anulare.</p>
      <h2>7. Ce trebuie să fac în caz de accident sau defecțiune?</h2>
      <p>În caz de accident, este important să anunți imediat autoritățile și să obții un raport de la poliție. Contactează-ne cât mai curând posibil pentru a primi asistență. În caz de defecțiune, echipa noastră de asistență rutieră este disponibilă 24/7 pentru a te ajuta.</p>
      <h2>8. Pot returna mașina într-o altă locație?</h2>
      <p>Da, oferim opțiunea de returnare a mașinii într-o altă locație decât cea de preluare, contra unei taxe suplimentare. Este important să menționezi acest lucru la momentul rezervării.</p>
      <h2>9. Pot închiria o mașină pentru o perioadă lungă de timp?</h2>
      <p>Da, oferim și închirieri pe termen lung. Contactează-ne pentru a discuta despre tarifele și condițiile speciale pentru închirieri pe termen lung.</p>
      <h2>10. Sunt permise călătoriile internaționale cu mașina închiriată?</h2>
      <p>Călătoriile internaționale sunt permise doar cu acordul prealabil al TRT Rent a Car. Este necesar să ne informezi despre destinațiile tale pentru a obține permisiunea și documentele necesare.</p>
      <p>În concluzie, TRT Rent a Car în Cluj-Napoca îți oferă soluții flexibile și accesibile pentru nevoile tale de transport. Fie că ai nevoie de o mașină pentru câteva zile sau pentru o perioadă mai lungă, suntem aici pentru a te ajuta. Contactează-ne pentru a afla mai multe și pentru a rezerva mașina perfectă pentru tine!</p>
    `,
      en: `
      <p>Renting a car can be the ideal solution for your trips, whether you are on holiday, on a business trip or simply need a temporary vehicle. If you are in Cluj-Napoca and looking for a car rental service, this guide is for you. We have gathered the questions we hear most often from our customers so you have the information you need.</p>
      <h2>1. Why choose TRT Rent a Car in Cluj-Napoca?</h2>
      <p>At TRT Rent a Car we focus on quality, professionalism and customer satisfaction. We offer a varied range of well-maintained cars, from economy models to SUVs and premium cars. We are also proud of excellent customer service and competitive rates.</p>
      <h2>2. What documents do I need to rent a car?</h2>
      <p>To rent a car from TRT Rent a Car you will need:</p>
      <ul>
        <li>A valid driving licence (national or international).</li>
        <li>An identity document (ID card or passport).</li>
        <li>A credit card in your name to guarantee the rental and cover any damage.</li>
      </ul>
      <h2>3. What is the minimum age to rent a car?</h2>
      <p>The minimum age to rent a car at TRT Rent a Car is 21, and the driver must have held a valid licence for at least one year. For some vehicle categories the minimum age may be higher.</p>
      <h2>4. What is included in the rental price?</h2>
      <p>The rental price includes:</p>
      <ul>
        <li>Use of the vehicle for the agreed period.</li>
        <li>Basic insurance (RCA).</li>
        <li>Unlimited kilometres for certain rental categories.</li>
        <li>24/7 roadside assistance.</li>
      </ul>
      <p>Extras such as full Casco cover, GPS, a child seat or an additional driver can be added for a fee.</p>
      <h2>5. How do I make a booking?</h2>
      <p>You can book a car online, through our website, or by phone. We recommend booking as early as possible so the vehicle you want is available.</p>
      <h2>6. What are the cancellation conditions?</h2>
      <p>Our cancellation policy allows you to cancel free of charge at least 48 hours before the pick-up date. If you cancel with less than 48 hours' notice, a cancellation fee may apply.</p>
      <h2>7. What should I do in case of an accident or a breakdown?</h2>
      <p>In an accident, notify the authorities immediately and obtain a police report. Contact us as soon as possible so we can assist you. If the car breaks down, our roadside assistance team is available 24/7.</p>
      <h2>8. Can I return the car at a different location?</h2>
      <p>Yes, you can return the car at a location other than the pick-up point, for an extra fee. Mention this when you book.</p>
      <h2>9. Can I rent a car for a longer period?</h2>
      <p>Yes, we also offer long-term rentals. Contact us to discuss rates and conditions for longer hires.</p>
      <h2>10. Are international trips allowed with the rental car?</h2>
      <p>International travel is allowed only with prior agreement from TRT Rent a Car. Tell us your destinations so we can grant permission and prepare the necessary documents.</p>
      <p>TRT Rent a Car in Cluj-Napoca offers flexible, accessible transport for your needs. Whether you need a car for a few days or for a longer period, we are here to help. Contact us to find out more and book the right car for you.</p>
    `,
    },
  },
  {
    id: "5",
    slug: "top-destinatii-de-weekend-langa-cluj",
    date: "2024-04-06",
    image: "/images/blog/apuseni.jpg",
    title: {
      ro: "Top destinații de weekend lângă Cluj: descoperă frumusețea Transilvaniei",
      en: "Top weekend destinations near Cluj: discover the beauty of Transylvania",
    },
    excerpt: {
      ro: "Cluj-Napoca este poarta către destinații de weekend pline de aventură și relaxare. Cinci locuri spectaculoase, la o distanță scurtă de oraș.",
      en: "Cluj-Napoca is the gateway to weekend destinations full of adventure and relaxation. Five striking places, a short drive from the city.",
    },
    content: {
      ro: `
      <p>Cluj-Napoca, un oraș vibrant și plin de istorie, este poarta de intrare către o varietate de destinații minunate pentru weekend-uri pline de aventură și relaxare. Dacă ești în căutarea unei evadări de la agitația orașului, îți recomandăm să explorezi aceste cinci destinații spectaculoase, situate la o distanță scurtă de Cluj-Napoca.</p>
      <h2>1. Castelul Bánffy de la Bonțida</h2>
      <p>La doar o scurtă plimbare cu mașina de la Cluj se află Castelul Bánffy de la Bonțida, o bijuterie arhitecturală încărcată de istorie și farmec. Acest castel impresionant datează din secolul al XV-lea și oferă o incursiune fascinantă în trecutul Transilvaniei. Poți admira grădinile frumos întreținute, vizita expozițiile de artă și chiar participa la evenimentele culturale care au loc aici.</p>
      <h2>2. Lacul Tarnița</h2>
      <p>Pentru iubitorii de natură și aventură, Lacul Tarnița este destinația ideală pentru un weekend relaxant. Situat la aproximativ o oră de condus de Cluj-Napoca, acest lac oferă o oază de liniște și frumusețe naturală. Poți închiria un caiac sau o canoe și explora apele limpezi ale lacului sau poți învăța să faci kitesurfing pentru o experiență mai îndrăzneață.</p>
      <h2>3. Cheile Turzii</h2>
      <p>Pentru aventurieri și iubitori ai activităților în aer liber, Cheile Turzii sunt un paradis natural ce nu trebuie ratat. Situate la doar o scurtă distanță de Cluj-Napoca, aceste chei impresionante oferă oportunități nenumărate pentru drumeții, escaladă și fotografie. Poți explora peisajele spectaculoase, potecile pitorești și formațiunile stâncoase fascinante în timp ce te bucuri de aerul proaspăt al munților.</p>
      <h2>4. Cetatea Alba Carolina din Alba Iulia</h2>
      <p>O excursie în Alba Iulia, la aproximativ șaptezeci de kilometri distanță de Cluj-Napoca, este o călătorie în inima istoriei Transilvaniei. Cetatea Alba Carolina, o capodoperă arhitecturală din secolul al XVIII-lea, te va purta înapoi în timp într-o epocă de glorie și regalitate. Poți explora zidurile impunătoare, fortificațiile bine păstrate și chiar participa la reconstituiri istorice captivante.</p>
      <h2>5. Stațiunea turistică Păltiniș</h2>
      <p>Pentru cei care caută o escapadă montană, stațiunea turistică Păltiniș este destinația perfectă. Situată la aproximativ două ore de condus de Cluj-Napoca, această stațiune oferă peisaje spectaculoase, aer proaspăt de munte și o varietate de activități recreative. Poți explora traseele de drumeție, poți schia în sezonul rece sau poți pur și simplu savura o cafea caldă într-unul din restaurantele cochete ale stațiunii.</p>
      <p>Indiferent de preferințele tale, aceste destinații de weekend lângă Cluj promit să ofere experiențe memorabile și să te încarce cu energie și inspirație pentru săptămânile ce vor urma. Așadar, pregătește-ți bagajele și pornește într-o călătorie către frumusețile Transilvaniei!</p>
    `,
      en: `
      <p>Cluj-Napoca, a lively city full of history, is the gateway to wonderful destinations for weekends of adventure and relaxation. If you want to escape the bustle of the city, explore these five striking places, a short distance from Cluj-Napoca.</p>
      <h2>1. Bánffy Castle in Bonțida</h2>
      <p>A short drive from Cluj brings you to Bánffy Castle in Bonțida, an architectural jewel rich in history and charm. The impressive castle dates from the 15th century and offers a fascinating look into Transylvania's past. You can admire the well-kept gardens, visit art exhibitions and join the cultural events held here.</p>
      <h2>2. Tarnița Lake</h2>
      <p>For lovers of nature and adventure, Tarnița Lake is the ideal place for a relaxing weekend. About an hour's drive from Cluj-Napoca, the lake is a quiet spot of natural beauty. You can rent a kayak or a canoe and explore the clear water, or try kitesurfing for a bolder experience.</p>
      <h2>3. Cheile Turzii</h2>
      <p>For adventurers and anyone who likes the outdoors, Turda Gorge is a natural paradise not to be missed. A short distance from Cluj-Napoca, the gorge offers countless opportunities for hiking, climbing and photography. Explore the striking landscapes, scenic paths and rock formations while you enjoy the fresh mountain air.</p>
      <h2>4. Alba Carolina Citadel in Alba Iulia</h2>
      <p>A trip to Alba Iulia, about seventy kilometres from Cluj-Napoca, is a journey into the heart of Transylvanian history. Alba Carolina Citadel, an 18th-century architectural masterpiece, takes you back to an age of glory and royalty. You can explore the imposing walls, the well-preserved fortifications and even join captivating historical re-enactments.</p>
      <h2>5. Păltiniș mountain resort</h2>
      <p>If you are looking for a mountain escape, Păltiniș is the perfect destination. About two hours' drive from Cluj-Napoca, the resort offers spectacular scenery, fresh mountain air and a variety of activities. You can hike the trails, ski in the cold season or simply enjoy a hot coffee in one of the resort's cosy restaurants.</p>
      <p>Whatever you prefer, these weekend destinations near Cluj promise memorable experiences and a fresh burst of energy for the weeks ahead. Pack your bags and set off to see the beauty of Transylvania.</p>
    `,
    },
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getLatestArticles(limit = 6): Article[] {
  return [...articles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}
