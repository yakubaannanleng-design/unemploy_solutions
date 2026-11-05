import { AlertTriangle } from "lucide-react";
import { useLang } from "lib/i18n";

type Section = { title: string; paragraphs: string[] };

const privacy: Record<"fr" | "en", Section[]> = {
  fr: [
    {
      title: "1. Responsable et portée",
      paragraphs: [
        "Cette politique décrit les catégories d'informations susceptibles d'être traitées lorsque vous utilisez Workca. Workca est un service d'Innovation Society (I-Society), développé et exploité par Madi Oumarou Yakuba. La forme juridique exacte et l'adresse professionnelle du responsable doivent être ajoutées avant publication définitive. Contact : yakubaannanleng@gmail.com.",
      ],
    },
    {
      title: "2. Informations traitées",
      paragraphs: [
        "Selon votre utilisation, Workca peut traiter vos coordonnées et identifiants de compte, les informations de profil candidat ou employeur, les offres, candidatures, favoris, alertes, messages, notifications, signalements et préférences d'interface. Ne fournissez pas de données sensibles qui ne sont pas nécessaires à votre démarche.",
        "Des données techniques nécessaires au fonctionnement et à la sécurité peuvent également être traitées par l'application et ses fournisseurs. Les journaux, durées et champs effectivement collectés doivent être confirmés pour l'environnement de production.",
      ],
    },
    {
      title: "3. Pourquoi ces informations sont utilisées",
      paragraphs: [
        "Les informations servent à créer et sécuriser les comptes, afficher les profils et offres, traiter les candidatures, permettre les échanges demandés, envoyer les notifications choisies, répondre aux signalements, maintenir le service et prévenir la fraude ou les abus.",
        "Workca ne doit pas vendre vos coordonnées à des annonceurs. Une communication externe intervient lorsque vous la déclenchez, par exemple en ouvrant un lien WhatsApp, ou lorsqu'elle est nécessaire au fonctionnement d'un fournisseur technique.",
      ],
    },
    {
      title: "4. Visibilité et partage",
      paragraphs: [
        "Les informations que vous publiez dans une offre ou un profil peuvent être visibles par les autres utilisateurs selon les fonctionnalités et paramètres de Workca. Les candidatures et messages sont transmis aux destinataires auxquels ils sont adressés. Évitez d'y inclure des informations que vous ne souhaitez pas partager.",
        "Supabase est le service backend et d'authentification actuellement déclaré pour Workca. Son rôle, les lieux de traitement, les garanties contractuelles et tout éventuel transfert hors du Cameroun doivent être vérifiés. Tout autre fournisseur (notamment l'hébergeur du site) devra être ajouté à cette liste avant publication.",
      ],
    },
    {
      title: "5. Stockage et sécurité",
      paragraphs: [
        "L'application peut utiliser Supabase pour l'authentification et les données de compte lorsque la configuration correspondante est active. Certaines préférences et données d'interface peuvent aussi être conservées dans le stockage du navigateur. Les environnements de démonstration peuvent avoir un comportement différent de la production.",
        "Des mesures techniques et organisationnelles adaptées doivent protéger les informations. Aucun système n'étant infaillible, ne partagez pas votre mot de passe et prévenez le contact Workca en cas d'incident suspect.",
      ],
    },
    {
      title: "6. Durée de conservation",
      paragraphs: [
        "Durées cibles proposées : conserver les données de compte et les contenus liés pendant la période d'activité du compte; après fermeture, les supprimer ou les anonymiser dans un délai de 30 jours; purger les sauvegardes techniques dans un délai maximal de 90 jours. Les données strictement nécessaires à une obligation légale, à la sécurité ou au traitement d'un litige peuvent être conservées séparément pendant la durée justifiée.",
        "Ces délais constituent une recommandation à mettre en œuvre et à vérifier dans les opérations Supabase, la fermeture de compte, les journaux et les sauvegardes avant d'affirmer qu'ils sont effectivement respectés. Une fermeture de compte ne supprime pas les copies déjà reçues par d'autres utilisateurs.",
      ],
    },
    {
      title: "7. Vos demandes",
      paragraphs: [
        "Selon les règles applicables, vous pouvez demander l'accès, la correction, la suppression ou la limitation de certaines données, ou vous opposer à certains traitements. Adressez votre demande à yakubaannanleng@gmail.com en précisant le compte concerné. Une vérification raisonnable de votre identité pourra être nécessaire.",
        "Les demandes seront examinées au regard du droit camerounais et des règles impératives applicables. Les délais de réponse et l'autorité compétente doivent être confirmés pour l'activité de Workca.",
      ],
    },
    {
      title: "8. Politique relative aux cookies et au stockage local",
      paragraphs: [
        "Les cookies sont de petits fichiers enregistrés par le navigateur. Le stockage local du navigateur est une technologie distincte, mais il peut également conserver des informations sur votre appareil. Workca utilise des mécanismes techniques nécessaires à certaines fonctions, notamment la session ou l'état de l'interface et des préférences. L'authentification Supabase peut conserver une session dans le navigateur lorsque le service est configuré.",
        "À la date de cette version, aucun outil publicitaire ou de suivi d'audience tiers n'est intentionnellement configuré dans le code de l'application. Cette déclaration doit être vérifiée pour le site publié, son hébergeur, les intégrations et les outils ajoutés ultérieurement. Les tiers ouverts via un lien externe peuvent appliquer leurs propres technologies.",
        "Vous pouvez supprimer les cookies et données de site depuis les paramètres de votre navigateur. Cela peut vous déconnecter, réinitialiser des préférences ou empêcher certaines fonctions. Une interface de consentement et de préférences devra être ajoutée si des traceurs non nécessaires sont déployés et que les règles applicables l'exigent.",
      ],
    },
    {
      title: "9. Modifications et contact",
      paragraphs: [
        "Cette politique pourra être mise à jour si les traitements ou le service changent. La version définitive devra indiquer sa date d'entrée en vigueur, la forme juridique et l'adresse professionnelle du responsable, les durées réellement appliquées, les fournisseurs et la procédure de demande.",
        "Pour toute question ou demande relative à vos données, écrivez à yakubaannanleng@gmail.com. Version de travail du 4 novembre 2026.",
      ],
    },
  ],
  en: [
    { title: "1. Controller and scope", paragraphs: ["This policy describes categories of information that may be processed when you use Workca. Workca is a service of Innovation Society (I-Society), developed and operated by Madi Oumarou Yakuba. The controller's exact legal form and business address must be added before final publication. Contact: yakubaannanleng@gmail.com."] },
    { title: "2. Information processed", paragraphs: ["Depending on how you use Workca, it may process account identifiers and contact details, job seeker or employer profile information, listings, applications, favorites, alerts, messages, notifications, reports and interface preferences. Do not provide sensitive information that is not needed.", "Technical data needed for operation and security may also be processed by the application and its providers. Production logging, retention periods and the fields actually collected must be confirmed."] },
    { title: "3. Why information is used", paragraphs: ["Information is used to create and secure accounts, display profiles and listings, handle applications, enable requested communications, send selected notifications, respond to reports, maintain the service and prevent fraud or abuse.", "Workca should not sell your contact details to advertisers. External disclosure occurs when you initiate it, for example by opening a WhatsApp link, or when needed by a technical provider to operate the service."] },
    { title: "4. Visibility and sharing", paragraphs: ["Information you publish in a listing or profile may be visible to other users depending on Workca features and settings. Applications and messages are sent to their intended recipients. Avoid including information you do not wish to share.", "Supabase is the backend and authentication service currently declared for Workca. Its role, processing locations, contractual safeguards and any transfers outside Cameroon must be checked. Any other provider (including the website host) must be added before publication."] },
    { title: "5. Storage and security", paragraphs: ["The application may use Supabase for authentication and account data when configured. Some preferences and interface data may also be kept in browser storage. Demonstration environments may behave differently from production.", "Appropriate technical and organizational measures should protect information. No system is infallible; do not share your password and notify Workca if you suspect an incident."] },
    { title: "6. Retention", paragraphs: ["Proposed retention targets: keep account data and related content while the account is active; after closure, delete or anonymize them within 30 days; purge technical backups within no more than 90 days. Data strictly needed for a legal duty, security or dispute handling may be kept separately for the justified period.", "These are recommended targets that must be implemented and checked in Supabase operations, account closure, logs and backups before claiming they are actually met. Closing an account does not remove copies already received by other users."] },
    { title: "7. Your requests", paragraphs: ["Depending on applicable rules, you may request access, correction, deletion or restriction of certain data, or object to certain processing. Contact yakubaannanleng@gmail.com and identify the relevant account. Reasonable identity verification may be required.", "Requests will be reviewed under Cameroonian law and mandatory applicable rules. Response deadlines and the competent authority must be confirmed for Workca's activities."] },
    { title: "8. Cookies and local storage", paragraphs: ["Cookies are small files stored by your browser. Browser local storage is a separate technology, but it can also retain information on your device. Workca uses technical mechanisms needed for some functions, including session or interface state and preferences. Supabase authentication may keep a session in the browser when configured.", "As of this draft, no third-party advertising or audience-tracking tool is intentionally configured in the application code. This must be checked against the published website, its host, integrations and any later-added tools. Third parties opened through external links may use their own technologies.", "You can clear cookies and site data in your browser settings. This may sign you out, reset preferences or prevent some features from working. A consent and preference interface should be added if non-essential trackers are deployed and applicable rules require it."] },
    { title: "9. Changes and contact", paragraphs: ["This policy may be updated when processing or the service changes. The final version should state its effective date, the controller's legal form and business address, implemented retention periods, providers and request procedure.", "For questions or requests about your information, contact yakubaannanleng@gmail.com. Working draft dated November 4, 2026."] },
  ],
};

export default function PrivacyView() {
  const { lang } = useLang();

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {lang === "fr" ? "Confidentialité et cookies" : "Privacy and Cookies"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {lang === "fr" ? "Version de travail — 4 novembre 2026" : "Working draft — November 4, 2026"}
        </p>
      </header>
      <aside className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
        <p>
          {lang === "fr"
            ? "Ce projet doit être vérifié avec les pratiques réelles de production. Il reste à confirmer la forme juridique et l'adresse professionnelle du responsable, l'application effective des délais de conservation, l'hébergeur et les transferts de données."
            : "This draft must be checked against actual production practices. The controller's legal form and business address, actual retention implementation, website host and data transfers still need confirmation."}
        </p>
      </aside>
      <div className="space-y-6">
        {privacy[lang].map((section, index) => (
          <section className="space-y-2" key={section.title} id={index === 7 ? "cookies" : undefined}>
            <h2 className="text-lg font-semibold">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p className="leading-relaxed text-muted-foreground" key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
