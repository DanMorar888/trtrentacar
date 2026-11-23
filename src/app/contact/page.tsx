import { ContactPageContent } from "@/components/ContactPageContent";
import { LazyMap } from "@/components/LazyMap";
import { ReviewsSection } from "@/components/ReviewsSection";
import { getDictionary, getLocale } from "@/i18n/get-locale";

export default function ContactPage() {
  const t = getDictionary(getLocale());

  return (
    <>
      <ContactPageContent />
      <ReviewsSection />
      <section className="section-dark border-t border-gray-700/50">
        <LazyMap
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3361.7777664320392!2d23.685427076757637!3d46.78240814452723!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47490b64f9a57925%3A0x248bd8241afed92e!2sAeroportul%20Interna%C8%9Bional%20Avram%20Iancu%20Cluj-Napoca!5e1!3m2!1sro!2sro!4v1774269599211!5m2!1sro!2sro"
          title={t.contact.mapTitle}
          className="block h-[450px] w-full"
        />
      </section>
    </>
  );
}
