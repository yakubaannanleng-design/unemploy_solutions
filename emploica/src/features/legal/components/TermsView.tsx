import { AlertTriangle } from "lucide-react";
import { useLang } from "lib/i18n";

type Section = { title: string; paragraphs: string[] };

const terms: Record<"fr" | "en", Section[]> = {
  fr: [
    {
      title: "1. Objet et acceptation",
      paragraphs: [
        "Les présentes conditions encadrent l'accès à Workca et son utilisation par les candidats, les employeurs et les visiteurs. En créant un compte ou en utilisant une fonctionnalité, vous reconnaissez en avoir pris connaissance. Si vous ne les acceptez pas, n'utilisez pas le service.",
        "Les règles de confidentialité et de cookies complètent ces conditions pour expliquer le traitement des informations et les technologies utilisées.",
      ],
    },
    {
      title: "2. Rôle de Workca",
      paragraphs: [
        "Workca est une plateforme de mise en relation. Elle permet notamment de publier et consulter des offres, de gérer des candidatures et d'échanger entre utilisateurs. Sauf accord distinct, Workca n'est ni l'employeur, ni l'agence de recrutement d'un utilisateur, ni partie à un contrat de travail conclu entre eux.",
        "La présence d'une offre ou d'un profil ne constitue ni une recommandation, ni une garantie d'identité, de solvabilité, de qualité, d'embauche ou de résultat. Chaque utilisateur doit effectuer ses propres vérifications.",
      ],
    },
    {
      title: "3. Compte et informations",
      paragraphs: [
        "Vous devez fournir des informations exactes, à jour et suffisamment complètes, et corriger celles qui deviennent inexactes. Vous êtes responsable de la confidentialité de vos identifiants et des activités réalisées depuis votre compte. Informez Workca sans délai si vous suspectez un accès non autorisé.",
        "N'usurpez pas l'identité d'une personne ou d'une entreprise, ne créez pas de compte pour contourner une suspension et n'utilisez pas les comptes d'autrui sans autorisation.",
      ],
    },
    {
      title: "4. Règles applicables aux employeurs",
      paragraphs: [
        "Un employeur doit être autorisé à publier l'offre et veiller à ce qu'elle soit réelle, exacte, actuelle, légale et suffisamment précise. Il doit décrire les missions, le lieu, les conditions et la rémunération de manière loyale, et mettre à jour ou retirer une offre qui n'est plus disponible.",
        "Il est interdit de demander à un candidat de payer pour obtenir un emploi, un entretien, une promesse d'embauche ou une vérification de dossier. Ne publiez pas d'offre trompeuse, discriminatoire, illicite, pyramidale ou destinée à collecter des données sans rapport avec le recrutement.",
      ],
    },
    {
      title: "5. Règles applicables aux candidats",
      paragraphs: [
        "Vous êtes responsable des renseignements et documents transmis dans votre profil, vos candidatures et vos messages. Ne transmettez que les informations nécessaires et que vous êtes autorisé à communiquer. N'envoyez pas de document ou de contenu appartenant à autrui sans autorisation.",
        "Vérifiez l'employeur et les conditions avant de transmettre des informations sensibles, de vous déplacer ou d'accepter une proposition. Signalez une offre suspecte et ne versez jamais d'argent pour accéder à un emploi.",
      ],
    },
    {
      title: "6. Contenus, messages et comportement",
      paragraphs: [
        "Vous gardez les droits que vous détenez sur vos contenus. Vous autorisez Workca, pour la durée nécessaire au fonctionnement du service, à héberger, afficher, transmettre et adapter techniquement ces contenus afin de présenter les profils, offres, candidatures et échanges aux personnes concernées.",
        "Il est interdit de publier des contenus illégaux, menaçants, diffamatoires, discriminatoires, frauduleux, portant atteinte à la vie privée ou aux droits de propriété intellectuelle. Sont également interdits le spam, l'extraction automatisée de données, l'introduction de code malveillant et toute tentative de perturber ou contourner les protections du service.",
      ],
    },
    {
      title: "7. Modération et signalements",
      paragraphs: [
        "Workca peut examiner les signalements, demander des précisions, limiter la visibilité d'un contenu, suspendre une fonctionnalité ou restreindre un compte lorsqu'une règle est enfreinte ou qu'un risque sérieux est constaté. Dans la mesure du possible, la mesure sera proportionnée à la situation.",
        "La modération ne signifie pas que chaque contenu est vérifié avant publication et ne remplace pas votre vigilance. Vous pouvez signaler une offre, un profil ou un message suspect par les moyens proposés dans le service ou en écrivant à l'adresse de contact.",
      ],
    },
    {
      title: "8. Tarifs et services payants",
      paragraphs: [
        "Les éventuels services payants, leurs fonctionnalités, leur prix et leurs modalités doivent être présentés avant toute confirmation. Aucun paiement ne peut être exigé d'un candidat en échange d'une promesse d'emploi ou d'une mise en relation garantie.",
      ],
    },
    {
      title: "9. Propriété intellectuelle",
      paragraphs: [
        "Workca, son nom, son interface et ses éléments graphiques sont protégés par les droits applicables. Sauf autorisation, vous ne pouvez pas copier, revendre, décompiler ou exploiter commercialement le service ou ses éléments.",
        "Vous conservez les droits sur vos contenus et garantissez disposer des autorisations nécessaires pour les publier. Vous pouvez demander leur retrait, sous réserve des sauvegardes techniques temporaires et des obligations légales de conservation.",
      ],
    },
    {
      title: "10. Disponibilité et liens externes",
      paragraphs: [
        "Le service peut être modifié, interrompu ou indisponible temporairement pour maintenance, sécurité ou raisons indépendantes de Workca. Les liens vers des services tiers sont fournis pour faciliter l'usage; leurs contenus, pratiques et disponibilités relèvent de leurs propres responsables.",
      ],
    },
    {
      title: "11. Responsabilité",
      paragraphs: [
        "Dans les limites permises par la loi, Workca ne garantit ni l'exactitude de tous les contenus publiés par les utilisateurs, ni l'obtention d'un emploi, ni la conclusion ou l'exécution d'une relation professionnelle. Les utilisateurs restent responsables de leurs décisions, échanges et engagements.",
        "Aucune disposition ne vise à exclure une responsabilité qui ne peut légalement être exclue. Les présentes conditions ne retirent pas les droits impératifs dont vous bénéficiez selon la loi applicable.",
      ],
    },
    {
      title: "12. Suspension et fin d'utilisation",
      paragraphs: [
        "Vous pouvez cesser d'utiliser Workca et demander la fermeture de votre compte. Workca peut suspendre ou fermer un compte en cas de violation des conditions, de risque pour les utilisateurs ou d'obligation légale. Lorsque cela est raisonnablement possible, le motif et les voies de contact seront communiqués.",
        "La fermeture du compte n'efface pas automatiquement les contenus déjà partagés avec d'autres utilisateurs ni les données qui doivent être conservées pour des raisons légales ou de sécurité. Consultez la politique de confidentialité.",
      ],
    },
    {
      title: "13. Modifications et droit applicable",
      paragraphs: [
        "Workca peut mettre à jour ces conditions pour refléter l'évolution du service ou des règles applicables. La date de mise à jour sera indiquée et, en cas de changement important, un avis pourra être affiché dans le service.",
        "Le droit camerounais est retenu comme droit applicable, sous réserve d'une validation juridique de cette clause et des règles impératives applicables à votre situation. Les juridictions compétentes seront déterminées selon les règles applicables.",
      ],
    },
    {
      title: "14. Contact",
      paragraphs: [
        "Workca est un service d'Innovation Society (I-Society), développé et exploité par Madi Oumarou Yakuba. Pour une question sur ces conditions, un signalement ou une demande relative à votre compte, écrivez à yakubaannanleng@gmail.com. La forme juridique exacte et l'adresse professionnelle de l'éditeur restent à préciser.",
      ],
    },
  ],
  en: [
    { title: "1. Purpose and acceptance", paragraphs: ["These terms govern access to and use of Workca by job seekers, employers and visitors. By creating an account or using a feature, you acknowledge that you have read them. If you do not agree, do not use the service.", "The privacy and cookie policy complements these terms by explaining how information and technologies are handled."] },
    { title: "2. Workca's role", paragraphs: ["Workca is a matching platform for posting and viewing jobs, managing applications and communicating between users. Unless agreed separately, Workca is not a user's employer or recruitment agency and is not a party to employment agreements between users.", "A listing or profile is not a recommendation or a guarantee of identity, solvency, quality, hiring or results. Users must make their own checks."] },
    { title: "3. Accounts and information", paragraphs: ["You must provide accurate, current and sufficiently complete information and correct it when it becomes inaccurate. You are responsible for keeping your credentials confidential and for activity on your account. Notify Workca promptly if you suspect unauthorized access.", "Do not impersonate a person or business, create accounts to evade a suspension, or use another person's account without permission."] },
    { title: "4. Employer rules", paragraphs: ["Employers must be authorized to post a listing and ensure it is genuine, accurate, current, lawful and sufficiently detailed. Describe duties, location, terms and compensation fairly, and update or remove listings that are no longer available.", "You must not ask a candidate to pay for a job, interview, job promise or background check. Misleading, discriminatory, unlawful, pyramid-scheme or unrelated data-collection listings are prohibited."] },
    { title: "5. Candidate rules", paragraphs: ["You are responsible for information and documents in your profile, applications and messages. Share only information that is necessary and that you are authorized to provide. Do not send another person's material without permission.", "Check the employer and terms before sharing sensitive information, travelling or accepting an offer. Report suspicious listings and never pay to access a job."] },
    { title: "6. Content, messages and conduct", paragraphs: ["You retain rights you hold in your content. You grant Workca a limited permission, for as long as needed to operate the service, to host, display, transmit and technically adapt that content to show relevant profiles, listings, applications and communications to the intended users.", "Illegal, threatening, defamatory, discriminatory, fraudulent, privacy-infringing or rights-infringing content is prohibited. Spam, automated data extraction, malicious code and attempts to disrupt or bypass service protections are also prohibited."] },
    { title: "7. Moderation and reports", paragraphs: ["Workca may review reports, request information, limit content visibility, suspend a feature or restrict an account when a rule is broken or a serious risk is identified. Where practicable, action will be proportionate.", "Moderation does not mean every item is checked before publication and does not replace your judgment. Report suspicious listings, profiles or messages using the service or the contact email."] },
    { title: "8. Fees and paid services", paragraphs: ["Any paid service, its features, price and terms must be presented before confirmation. A candidate may not be charged for a promise of employment or a guaranteed introduction."] },
    { title: "9. Intellectual property", paragraphs: ["Workca, its name, interface and visual elements are protected by applicable rights. You may not copy, resell, decompile or commercially exploit the service or its elements without permission.", "You retain rights in your content and warrant that you have permission to publish it. You may request removal, subject to temporary technical backups and legal retention duties."] },
    { title: "10. Availability and external links", paragraphs: ["The service may be changed, interrupted or temporarily unavailable for maintenance, security or reasons beyond Workca's control. Third-party links are provided for convenience; those services' content, practices and availability are their operators' responsibility."] },
    { title: "11. Liability", paragraphs: ["To the extent permitted by law, Workca does not guarantee that all user content is accurate, that a job will be obtained, or that a professional relationship will be entered into or performed. Users remain responsible for their decisions, communications and commitments.", "Nothing in these terms excludes liability that cannot lawfully be excluded or removes mandatory rights you have under applicable law."] },
    { title: "12. Suspension and ending use", paragraphs: ["You may stop using Workca and request account closure. Workca may suspend or close an account for a breach, user risk or legal obligation. Where reasonably possible, the reason and contact options will be provided.", "Closing an account does not automatically remove content already shared with other users or data that must be retained for legal or security reasons. See the privacy policy."] },
    { title: "13. Changes and governing law", paragraphs: ["Workca may update these terms to reflect service changes or applicable rules. The revision date will be shown and a notice may be provided for material changes.", "Cameroonian law is selected as the governing law, subject to legal review of this clause and mandatory rules applicable to your situation. Competent courts will be determined under applicable rules."] },
    { title: "14. Contact", paragraphs: ["Workca is a service of Innovation Society (I-Society), developed and operated by Madi Oumarou Yakuba. For questions about these terms, reports or account requests, contact yakubaannanleng@gmail.com. The publisher's exact legal form and business address still need to be specified."] },
  ],
};

export default function TermsView() {
  const { lang } = useLang();
  const sections = terms[lang];

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {lang === "fr" ? "Conditions d'utilisation de Workca" : "Workca Terms of Use"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {lang === "fr" ? "Version de travail — 4 novembre 2026" : "Working draft — November 4, 2026"}
        </p>
      </header>
      <aside className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
        <p>
          {lang === "fr"
            ? "Ce texte est un projet informatif, pas un avis juridique ni une version prête à publication. La forme juridique et l'adresse professionnelle de l'éditeur, ainsi que plusieurs modalités opérationnelles, doivent être confirmées; une relecture juridique reste recommandée."
            : "This is an informational draft, not legal advice or a publication-ready document. The publisher's legal form and business address, along with several operational details, must be confirmed; legal review is still recommended."}
        </p>
      </aside>
      <div className="space-y-6">
        {sections.map((section) => (
          <section className="space-y-2" key={section.title}>
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
