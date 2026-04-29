import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  GitBranch,
  Lock,
  Mail,
  Search,
  Server,
  Shield,
  Star,
  Zap,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { LOCALE_BUNDLES, type LocaleCode } from '../i18n/locales';

interface LandingProps {
  onNavigate: (page: string) => void;
  locale: LocaleCode;
}

const LANDING_CONTENT: Record<LocaleCode, any> = {
  en: {
    languageLabel: 'Language:',
    hero: {
      badge: 'Security Monitoring & Engineering',
      titleLine1: 'Stop Exploits',
      titleLine2: 'Before They Happen',
      description: 'Continuous security monitoring, invariant testing, and regression support for DeFi protocols.',
      primaryCta: 'Start Monitoring - $499/mo',
      secondaryCta: 'View Plans & Pricing',
      trustItems: [
        { title: 'Deterministic', desc: 'Reproducible results' },
        { title: 'Real Impact', desc: 'Find critical risks early' },
        { title: 'Proof-Ready', desc: 'Immunefi-ready reports' },
      ],
    },
    dashboard: {
      badge: 'See It In Action',
      title: 'Real-time Security Monitoring',
      videoCaption: 'Live dashboard walkthrough of the GMX Audit monitoring workflow.',
      imageAlt: 'GMX Audit dashboard preview',
      imageCaption: 'Static dashboard preview showing risk scoring and findings.',
      videoUnsupported: 'Your browser cannot play this video. Use the dashboard image below or open the file directly.',
      openVideo: 'Open video file',
    },
    value: {
      badge: 'Why GMX Audit?',
      title: 'Built for DeFi Risk',
      items: [
        { title: 'Detect real economic vulnerabilities', desc: 'Invariant testing on real blockchain states to find what matters.' },
        { title: 'Continuous regression monitoring', desc: 'Nightly or weekly scans keep your protocol protected as it evolves.' },
        { title: 'Proof-ready reports', desc: 'Reproducible evidence packaged for Immunefi and internal reviews.' },
      ],
    },
    pricing: {
      badge: 'Choose Your Plan',
      title: 'Simple, Transparent Pricing',
      description: 'All plans include deterministic monitoring and expert-backed support.',
      mostPopular: 'Most Popular',
      ctaGrowth: 'Start Growth Plan',
      ctaPro: 'Upgrade to Pro',
      ctaEnterprise: 'Contact Sales',
      ctaCustom: "Let's Talk",
    },
    how: {
      badge: 'How It Works',
      title: 'From Data to Detection',
      steps: [
        { title: 'Fork', desc: 'Fork real chain at any block' },
        { title: 'Test', desc: 'Run invariant test suite' },
        { title: 'Detect', desc: 'Analyze & rank the risks' },
        { title: 'Report', desc: 'Generate proof-ready report' },
      ],
    },
    trust: {
      title: 'Trusted By Security-Focused Teams',
      badges: ['DeFi Protocols', 'Audit Firms', 'Security Researchers', 'Web3 Builders'],
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        { q: 'What does GMX Audit monitor?', a: 'We monitor invariant integrity, regression drift, and risk signals tied to real protocol behavior.' },
        { q: 'How is the service delivered?', a: 'Everything is delivered digitally through dashboards, alerts, proof artifacts, and engineering support.' },
        { q: 'Who is this for?', a: 'DeFi protocol teams, audit groups, and engineering teams shipping high-risk releases.' },
        { q: 'How do we get started?', a: 'Choose a plan, complete checkout, and we confirm your onboarding scope quickly.' },
        { q: 'Are custom scopes available?', a: 'Yes. Enterprise and Custom plans include tailored coverage and bespoke engagement scopes.' },
        { q: 'What is your refund policy?', a: 'Billing errors are reviewed promptly; monthly plans are generally non-refundable once service allocation begins.' },
      ],
    },
    contact: {
      title: 'Get in Touch',
      description: 'We respond within one business day.',
      email: 'Email',
      cta: 'Request Access',
    },
    sticky: {
      title: 'Start Monitoring Today',
      subtitle: 'Growth Plan - $499/mo',
      cta: 'Get Started',
    },
    footer: {
      copyright: '© 2026 GMX Audit Control Center',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      support: 'Support',
      summary: 'Digital engineering support, monitoring, and audit-related services.',
    },
  },
  es: {
    languageLabel: 'Idioma:',
    hero: {
      badge: 'Monitoreo de Seguridad e Ingenieria',
      titleLine1: 'Deten Exploits',
      titleLine2: 'Antes de que Ocurran',
      description: 'Monitoreo continuo de seguridad, pruebas de invariantes y soporte de regresion para protocolos DeFi.',
      primaryCta: 'Comenzar Monitoreo - $499/mes',
      secondaryCta: 'Ver Planes y Precios',
      trustItems: [
        { title: 'Determinista', desc: 'Resultados reproducibles' },
        { title: 'Impacto Real', desc: 'Encuentra riesgos criticos temprano' },
        { title: 'Listo para Pruebas', desc: 'Reportes listos para Immunefi' },
      ],
    },
    dashboard: {
      badge: 'Ver en Accion',
      title: 'Monitoreo de Seguridad en Tiempo Real',
      videoCaption: 'Recorrido del panel de monitoreo de GMX Audit.',
      imageAlt: 'Vista previa del panel de GMX Audit',
      imageCaption: 'Vista previa estatica con puntuacion de riesgo y hallazgos.',
      videoUnsupported: 'Tu navegador no puede reproducir este video. Usa la imagen o abre el archivo directamente.',
      openVideo: 'Abrir archivo de video',
    },
    value: {
      badge: 'Por que GMX Audit?',
      title: 'Creado para Riesgo DeFi',
      items: [
        { title: 'Detecta vulnerabilidades economicas reales', desc: 'Pruebas de invariantes en estados reales de cadena para encontrar lo importante.' },
        { title: 'Monitoreo continuo de regresion', desc: 'Escaneos nocturnos o semanales protegen tu protocolo mientras evoluciona.' },
        { title: 'Reportes listos para pruebas', desc: 'Evidencia reproducible para Immunefi y revisiones internas.' },
      ],
    },
    pricing: {
      badge: 'Elige tu Plan',
      title: 'Precios Simples y Transparentes',
      description: 'Todos los planes incluyen monitoreo determinista y soporte experto.',
      mostPopular: 'Mas Popular',
      ctaGrowth: 'Iniciar Plan Growth',
      ctaPro: 'Actualizar a Pro',
      ctaEnterprise: 'Contactar Ventas',
      ctaCustom: 'Hablemos',
    },
    how: {
      badge: 'Como Funciona',
      title: 'De Datos a Deteccion',
      steps: [
        { title: 'Fork', desc: 'Haz fork de la cadena en cualquier bloque' },
        { title: 'Test', desc: 'Ejecuta la suite de invariantes' },
        { title: 'Detectar', desc: 'Analiza y clasifica riesgos' },
        { title: 'Reporte', desc: 'Genera reporte listo para pruebas' },
      ],
    },
    trust: {
      title: 'Confiado por Equipos Enfocados en Seguridad',
      badges: ['Protocolos DeFi', 'Firmas de Auditoria', 'Investigadores de Seguridad', 'Builders Web3'],
    },
    faq: {
      title: 'Preguntas Frecuentes',
      items: [
        { q: 'Que monitorea GMX Audit?', a: 'Monitoreamos integridad de invariantes, deriva de regresion y senales de riesgo del comportamiento real del protocolo.' },
        { q: 'Como se entrega el servicio?', a: 'Todo se entrega digitalmente mediante paneles, alertas, evidencias y soporte de ingenieria.' },
        { q: 'Para quien es?', a: 'Equipos DeFi, grupos de auditoria y equipos de ingenieria con lanzamientos de alto riesgo.' },
        { q: 'Como empezamos?', a: 'Elige un plan, completa el pago y confirmamos rapidamente el alcance de onboarding.' },
        { q: 'Hay alcances personalizados?', a: 'Si. Enterprise y Custom incluyen cobertura a medida.' },
        { q: 'Cual es la politica de reembolso?', a: 'Los errores de facturacion se revisan rapido; los planes mensuales generalmente no son reembolsables una vez iniciado el servicio.' },
      ],
    },
    contact: {
      title: 'Ponte en Contacto',
      description: 'Respondemos dentro de un dia habil.',
      email: 'Correo',
      cta: 'Solicitar Acceso',
    },
    sticky: {
      title: 'Comienza a Monitorear Hoy',
      subtitle: 'Plan Growth - $499/mes',
      cta: 'Comenzar',
    },
    footer: {
      copyright: '© 2026 GMX Audit Control Center',
      privacy: 'Politica de Privacidad',
      terms: 'Terminos del Servicio',
      support: 'Soporte',
      summary: 'Soporte de ingenieria digital, monitoreo y servicios relacionados con auditorias.',
    },
  },
  fr: {
    languageLabel: 'Langue :',
    hero: {
      badge: 'Surveillance de Securite et Ingenierie',
      titleLine1: 'Stoppez les Exploits',
      titleLine2: 'Avant Qu ils Arrivent',
      description: 'Surveillance continue de securite, tests d invariants et support de regression pour les protocoles DeFi.',
      primaryCta: 'Demarrer la Surveillance - 499$/mois',
      secondaryCta: 'Voir les Offres et Tarifs',
      trustItems: [
        { title: 'Deterministe', desc: 'Resultats reproductibles' },
        { title: 'Impact Reel', desc: 'Detectez les risques critiques plus tot.' },
        { title: 'Pret a la Preuve', desc: 'Rapports prets pour Immunefi' },
      ],
    },
    dashboard: {
      badge: 'Voir en Action',
      title: 'Surveillance de Securite en Temps Reel',
      videoCaption: 'Parcours du tableau de bord GMX Audit.',
      imageAlt: 'Apercu du tableau de bord GMX Audit',
      imageCaption: 'Apercu statique montrant score de risque et resultats.',
      videoUnsupported: 'Votre navigateur ne peut pas lire cette video. Utilisez l image ou ouvrez le fichier directement.',
      openVideo: 'Ouvrir le fichier video',
    },
    value: {
      badge: 'Pourquoi GMX Audit ?',
      title: 'Concu pour le Risque DeFi',
      items: [
        { title: 'Detecter les vulnerabilites economiques reelles', desc: 'Tests d invariants sur des etats reels pour trouver ce qui compte.' },
        { title: 'Surveillance continue de regression', desc: 'Des scans nocturnes ou hebdomadaires protegent votre protocole pendant son evolution.' },
        { title: 'Rapports prets a la preuve', desc: 'Preuves reproductibles pour Immunefi et revues internes.' },
      ],
    },
    pricing: {
      badge: 'Choisissez Votre Offre',
      title: 'Tarification Simple et Transparente',
      description: 'Toutes les offres incluent surveillance deterministe et support expert.',
      mostPopular: 'Le Plus Populaire',
      ctaGrowth: 'Demarrer Offre Growth',
      ctaPro: 'Passer a Pro',
      ctaEnterprise: 'Contacter les Ventes',
      ctaCustom: 'Parlons-en',
    },
    how: {
      badge: 'Fonctionnement',
      title: 'Des Donnees a la Detection',
      steps: [
        { title: 'Fork', desc: 'Fork de la chaine a n importe quel bloc' },
        { title: 'Test', desc: 'Execution de la suite d invariants' },
        { title: 'Detecter', desc: 'Analyser et classer les risques' },
        { title: 'Rapport', desc: 'Generer un rapport pret a la preuve' },
      ],
    },
    trust: {
      title: 'Utilise par des Equipes Orientees Securite',
      badges: ['Protocoles DeFi', 'Cabinets d Audit', 'Chercheurs en Securite', 'Builders Web3'],
    },
    faq: {
      title: 'Questions Frequentes',
      items: [
        { q: 'Que surveille GMX Audit ?', a: 'Nous surveillons les invariants, la derive de regression et les signaux de risque lies au comportement reel.' },
        { q: 'Comment le service est-il fourni ?', a: 'Tout est livre numeriquement via tableaux de bord, alertes, preuves et support d ingenierie.' },
        { q: 'A qui cela s adresse ?', a: 'Aux equipes DeFi, cabinets d audit et equipes d ingenierie qui livrent des versions a risque.' },
        { q: 'Comment commencer ?', a: 'Choisissez une offre, finalisez le paiement et nous confirmons rapidement votre onboarding.' },
        { q: 'Des perimetres personnalises sont-ils possibles ?', a: 'Oui. Les offres Enterprise et Custom incluent une couverture sur mesure.' },
        { q: 'Quelle est la politique de remboursement ?', a: 'Les erreurs de facturation sont examinees rapidement; les offres mensuelles sont en general non remboursables apres demarrage.' },
      ],
    },
    contact: {
      title: 'Contactez-nous',
      description: 'Nous repondons sous un jour ouvrable.',
      email: 'Email',
      cta: 'Demander l Acces',
    },
    sticky: {
      title: 'Demarrez la Surveillance Aujourd hui',
      subtitle: 'Offre Growth - 499$/mois',
      cta: 'Commencer',
    },
    footer: {
      copyright: '© 2026 GMX Audit Control Center',
      privacy: 'Politique de Confidentialite',
      terms: 'Conditions d Utilisation',
      support: 'Support',
      summary: 'Support d ingenierie numerique, surveillance et services lies aux audits.',
    },
  },
};

function HeroSection({ content }: { content: any }) {
  const trustItems = [
    {
      icon: <Shield className="h-6 w-6 text-cyan-400" />,
      title: content.hero.trustItems[0].title,
      desc: content.hero.trustItems[0].desc,
    },
    {
      icon: <Search className="h-6 w-6 text-cyan-400" />,
      title: content.hero.trustItems[1].title,
      desc: content.hero.trustItems[1].desc,
    },
    {
      icon: <FileText className="h-6 w-6 text-cyan-400" />,
      title: content.hero.trustItems[2].title,
      desc: content.hero.trustItems[2].desc,
    },
  ];

  return (
    <section id="hero" aria-labelledby="hero-title" className="bg-slate-950 px-4 py-16 sm:px-6 sm:py-20 lg:min-h-screen lg:py-28">
      <div className="mx-auto w-full max-w-5xl">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
          <p className="inline-flex rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            {content.hero.badge}
          </p>

          <h1 id="hero-title" className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {content.hero.titleLine1}
            <br />
            <span className="text-cyan-400">{content.hero.titleLine2}</span>
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {content.hero.description}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="#pricing"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-4 text-lg font-semibold text-white transition-colors hover:bg-cyan-400 sm:w-auto sm:text-base"
            >
              {content.hero.primaryCta}
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#pricing"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-700 px-5 py-4 text-lg font-semibold text-white transition-colors hover:border-cyan-500 sm:w-auto sm:text-base"
            >
              {content.hero.secondaryCta}
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {trustItems.map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="mb-2 inline-flex rounded-lg border border-slate-800 bg-slate-900 p-2">{item.icon}</div>
                <p className="text-base font-semibold text-white">{item.title}</p>
                <p className="text-base text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </header>
      </div>
    </section>
  );
}

function DashboardProofSection({ content }: { content: any }) {
  const heroVideoSrc = `${import.meta.env.BASE_URL}hero-preview.mp4`;
  const heroImageSrc = `${import.meta.env.BASE_URL}Bounty-rotation.jpeg`;
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="monitoring-title" className="bg-slate-950 px-4 pb-12 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto w-full max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">{content.dashboard.badge}</p>
        <h2 id="monitoring-title" className="mt-2 text-2xl font-bold text-white sm:text-3xl">{content.dashboard.title}</h2>

        <div className="mt-4 space-y-4">
          <figure className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
            {!videoFailed ? (
              <video
                className="w-full"
                controls
                playsInline
                preload="metadata"
                poster={heroImageSrc}
                onError={() => setVideoFailed(true)}
              >
                <source src={heroVideoSrc} type="video/mp4" />
                {content.dashboard.videoUnsupported}
              </video>
            ) : (
              <div className="space-y-3 p-4">
                <img className="w-full rounded-lg" src={heroImageSrc} alt={content.dashboard.imageAlt} loading="lazy" />
                <p className="text-sm text-slate-300">{content.dashboard.videoUnsupported}</p>
                <a
                  href={heroVideoSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-lg border border-cyan-500 px-3 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/10"
                >
                  {content.dashboard.openVideo}
                </a>
              </div>
            )}
            <figcaption className="sr-only">{content.dashboard.videoCaption}</figcaption>
          </figure>
          <figure className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
            <img
              className="w-full"
              src={heroImageSrc}
              alt={content.dashboard.imageAlt}
              loading="lazy"
            />
            <figcaption className="sr-only">{content.dashboard.imageCaption}</figcaption>
          </figure>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6">
          {isVisible ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <p className="text-base text-slate-400">Security Score</p>
                  <p className="mt-2 text-4xl font-bold text-emerald-400">82</p>
                  <p className="text-base text-slate-300">/100</p>
                  <p className="mt-2 text-base text-emerald-400">↑ 12 pts vs last 7 days</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <p className="text-base text-slate-400">High / Critical</p>
                  <p className="mt-2 text-4xl font-bold text-red-400">2</p>
                  <p className="text-base text-slate-300">Alerts</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <p className="text-base text-slate-400">Runs</p>
                  <p className="mt-2 text-3xl font-bold text-white">7</p>
                  <p className="text-base text-slate-300">Completed</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <p className="text-base text-slate-400">Score Trend (7 Days)</p>
                  <div className="mt-4 h-14 rounded-lg bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-cyan-500/20" />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-base font-semibold text-white">Recent Findings</p>
                  <a href="#faq" className="text-base font-medium text-cyan-400 hover:text-cyan-300">
                    View all
                  </a>
                </div>
                <ul className="space-y-2 text-base">
                  <li className="flex items-center justify-between text-slate-200">
                    <span>Oracle freshness failure</span>
                    <span className="font-semibold text-red-400">High</span>
                  </li>
                  <li className="flex items-center justify-between text-slate-200">
                    <span>Overborrowing risk detected</span>
                    <span className="font-semibold text-red-400">High</span>
                  </li>
                  <li className="flex items-center justify-between text-slate-200">
                    <span>Capital conservation violation</span>
                    <span className="font-semibold text-yellow-400">Medium</span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="h-72 animate-pulse rounded-xl bg-slate-800/60" />
          )}
        </div>
      </div>
    </section>
  );
}

function ValueSection({ content }: { content: any }) {
  const items = [
    {
      icon: <Activity className="h-6 w-6 text-cyan-400" />,
      title: content.value.items[0].title,
      desc: content.value.items[0].desc,
    },
    {
      icon: <GitBranch className="h-6 w-6 text-cyan-400" />,
      title: content.value.items[1].title,
      desc: content.value.items[1].desc,
    },
    {
      icon: <FileText className="h-6 w-6 text-cyan-400" />,
      title: content.value.items[2].title,
      desc: content.value.items[2].desc,
    },
  ];

  return (
    <section id="services" aria-labelledby="services-title" className="bg-slate-950 px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">{content.value.badge}</p>
        <h2 id="services-title" className="mt-2 text-2xl font-bold text-white sm:text-3xl">{content.value.title}</h2>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="inline-flex rounded-full border border-slate-700 bg-slate-950 p-3">{item.icon}</div>
              <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-base text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type PricingPlan = {
  name: string;
  subtitle: string;
  price: string;
  accent: string;
  button: string;
  href: string;
  icon: JSX.Element;
  features: string[];
  popular?: boolean;
};

function PricingSection({ content }: { content: any }) {
  const plans: PricingPlan[] = [
    {
      name: 'Growth (CI Basic)',
      subtitle: 'Best for teams that need a reliable security gate.',
      price: '$499 /mo',
      accent: 'border-emerald-500/60',
      button: 'bg-cyan-500 hover:bg-cyan-400',
      href: 'https://buy.stripe.com/fZu9AT3Np2Sp48l4NygnK00',
      icon: <Shield className="h-6 w-6 text-emerald-400" />,
      features: [
        'Nightly or weekly scans',
        'Automated triage & alerts',
        'Reproducible artifacts',
        'Multi-chain monitoring',
        'CI-native (GitHub Actions)',
      ],
    },
    {
      name: 'Regression Pro',
      subtitle: 'For teams shipping frequently or managing real TVL.',
      price: '$2,500 /mo',
      accent: 'border-purple-500/60',
      button: 'bg-purple-500 hover:bg-purple-400',
      href: 'https://buy.stripe.com/28E3cv6ZBcsZeMZ93OgnK01',
      icon: <Star className="h-6 w-6 text-purple-400" />,
      popular: true,
      features: [
        'Everything in Growth',
        'Security score & trend reporting',
        'Weekly digest reports',
        'Tuning support',
        'Priority monitoring',
      ],
    },
    {
      name: 'Bounty Enterprise',
      subtitle: 'For high TVL protocols that need dedicated coverage.',
      price: '$8,000 /mo',
      accent: 'border-orange-500/60',
      button: 'bg-orange-500 hover:bg-orange-400',
      href: 'mailto:rigovivas71@gmail.com?subject=Bounty%20Enterprise%20Plan',
      icon: <Lock className="h-6 w-6 text-orange-400" />,
      features: [
        'Everything in Pro',
        'Custom invariants',
        'Incident response window',
        'White-label reports',
        'Dedicated security engineer',
      ],
    },
    {
      name: 'Custom',
      subtitle: 'Tailored solutions for enterprises and compliance.',
      price: '$15,000+ /mo',
      accent: 'border-blue-500/60',
      button: 'bg-blue-500 hover:bg-blue-400',
      href: 'mailto:rigovivas71@gmail.com?subject=Custom%20Plan%20Inquiry',
      icon: <Server className="h-6 w-6 text-blue-400" />,
      features: [
        'Dedicated infrastructure',
        'SSO & RBAC',
        'Custom integrations',
        'SLA & priority support',
      ],
    },
  ];

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="bg-slate-950 px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">{content.pricing.badge}</p>
        <h2 id="pricing-title" className="mt-2 text-2xl font-bold text-white sm:text-3xl">{content.pricing.title}</h2>
        <p className="mt-2 text-base text-slate-400">
          {content.pricing.description}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {plans.map((plan) => (
            <article key={plan.name} className={`relative rounded-2xl border ${plan.accent} bg-slate-900/80 p-6`}>
              {plan.popular && (
                <span className="absolute right-4 top-4 rounded-full bg-purple-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {content.pricing.mostPopular}
                </span>
              )}

              <div className="mb-4 inline-flex rounded-lg border border-slate-700 bg-slate-950 p-2">{plan.icon}</div>
              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              <p className="mt-2 text-base text-slate-400">{plan.subtitle}</p>
              <p className="mt-3 text-3xl font-bold text-white">{plan.price}</p>

              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-base text-slate-200">
                    <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                target={plan.href.startsWith('http') ? '_blank' : undefined}
                rel={plan.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-lg font-semibold text-white transition-colors sm:text-base ${plan.button}`}
              >
                {plan.name === 'Growth (CI Basic)'
                  ? content.pricing.ctaGrowth
                  : plan.name === 'Regression Pro'
                    ? content.pricing.ctaPro
                    : plan.name === 'Bounty Enterprise'
                      ? content.pricing.ctaEnterprise
                      : content.pricing.ctaCustom}
                <ArrowRight className="h-5 w-5" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection({ content }: { content: any }) {
  const steps = [
    { icon: <GitBranch className="h-6 w-6 text-cyan-400" />, title: content.how.steps[0].title, desc: content.how.steps[0].desc },
    { icon: <Zap className="h-6 w-6 text-cyan-400" />, title: content.how.steps[1].title, desc: content.how.steps[1].desc },
    { icon: <Search className="h-6 w-6 text-cyan-400" />, title: content.how.steps[2].title, desc: content.how.steps[2].desc },
    { icon: <FileText className="h-6 w-6 text-cyan-400" />, title: content.how.steps[3].title, desc: content.how.steps[3].desc },
  ];

  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="bg-slate-950 px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">{content.how.badge}</p>
        <h2 id="how-it-works-title" className="mt-2 text-2xl font-bold text-white sm:text-3xl">{content.how.title}</h2>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          {steps.map((step, idx) => (
            <div key={step.title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="mb-3 inline-flex rounded-full border border-slate-700 bg-slate-950 p-3">{step.icon}</div>
              <p className="text-base font-semibold text-white">{step.title}</p>
              <p className="mt-1 text-base text-slate-400">{step.desc}</p>
              {idx < steps.length - 1 && (
                <p className="mt-3 text-base font-semibold text-cyan-400 md:hidden">↓</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustStripSection({ content }: { content: any }) {
  const badges = content.trust.badges;

  return (
    <section aria-labelledby="trusted-title" className="border-y border-slate-800 bg-slate-950 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <h2 id="trusted-title" className="sr-only">{content.trust.title}</h2>
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
          {content.trust.title}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {badges.map((badge: string) => (
            <span key={badge} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-base text-slate-200">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ content }: { content: any }) {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = content.faq.items;

  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-slate-950 px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <h2 id="faq-title" className="text-2xl font-bold text-white sm:text-3xl">{content.faq.title}</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((faq: { q: string; a: string }, i: number) => (
            <article key={faq.q} className="rounded-xl border border-slate-800 bg-slate-900/70">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-base font-semibold text-white">{faq.q}</span>
                {open === i ? (
                  <ChevronUp className="h-5 w-5 text-cyan-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </button>
              {open === i && <p className="px-5 pb-4 text-base text-slate-300">{faq.a}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ content }: { content: any }) {
  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-slate-950 px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8">
        <h2 id="contact-title" className="text-2xl font-bold text-white sm:text-3xl">{content.contact.title}</h2>
        <p className="mt-2 text-base text-slate-300">{content.contact.description}</p>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <Mail className="mt-1 h-5 w-5 text-cyan-400" />
          <div>
            <p className="text-base text-slate-400">{content.contact.email}</p>
            <a href="mailto:rigovivas71@gmail.com" className="text-base font-semibold text-white hover:text-cyan-400">
              rigovivas71@gmail.com
            </a>
          </div>
        </div>

        <a
          href="#pricing"
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-4 text-lg font-semibold text-white transition-colors hover:bg-cyan-400 sm:text-base"
        >
          {content.contact.cta}
          <ArrowRight className="h-5 w-5" />
        </a>
      </div>
    </section>
  );
}

function SiteFooter({ content }: { content: any }) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base text-slate-400">{content.footer.copyright}</p>
        <div className="flex flex-wrap gap-4">
          <a href="#/privacy" className="text-base text-slate-300 hover:text-white">
            {content.footer.privacy}
          </a>
          <a href="#/terms" className="text-base text-slate-300 hover:text-white">
            {content.footer.terms}
          </a>
          <a href="#contact" className="text-base text-slate-300 hover:text-white">
            {content.footer.support}
          </a>
        </div>
      </div>
      <p className="mx-auto mt-3 w-full max-w-6xl text-base text-slate-500">
        {content.footer.summary}
      </p>
    </footer>
  );
}

function StickyMobileCTA({ content }: { content: any }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/95 px-3 py-2 md:hidden">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Shield className="h-5 w-5 flex-shrink-0 text-cyan-400" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">{content.sticky.title}</p>
            <p className="truncate text-xs text-slate-400">{content.sticky.subtitle}</p>
          </div>
        </div>
        <a
          href="#pricing"
          className="ml-auto inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-400"
        >
          {content.sticky.cta}
          <ArrowRight className="ml-1 h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

type LegalPageType = 'privacy' | 'terms';

function LegalPage({ page, onNavigate }: { page: LegalPageType; onNavigate: (page: string) => void }) {
  const title = page === 'privacy' ? 'Privacy Policy' : 'Terms of Service';

  return (
    <section className="min-h-screen bg-[#050d1a] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <a
            href="#"
            onClick={() => {
              onNavigate('home');
              window.location.hash = '';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 text-[#0ea5e9] hover:text-[#38bdf8] text-sm"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Home
          </a>
        </div>

        <div className="rounded-2xl border border-[#1a2f4a] bg-[#0a1628] p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-[#64748b] text-sm mb-8">Last updated: April 26, 2026</p>

          {page === 'privacy' ? (
            <div className="space-y-7 text-[#cbd5e1] text-sm leading-relaxed">
              <section>
                <h2 className="text-white text-lg font-semibold mb-2">Information We Collect</h2>
                <p>
                  We collect information you submit through our contact and request forms, including name, email address,
                  and company/team name. We also collect operational analytics required to maintain service reliability and
                  security.
                </p>
              </section>
              <section>
                <h2 className="text-white text-lg font-semibold mb-2">How We Use Information</h2>
                <p>
                  We use submitted data to respond to inquiries, scope engagements, deliver updates, and provide digital
                  engineering/security support services. We do not sell personal data.
                </p>
              </section>
              <section>
                <h2 className="text-white text-lg font-semibold mb-2">Data Sharing</h2>
                <p>
                  We may share data with essential service providers used for operations (for example, hosting,
                  communications, and payment processing) under appropriate confidentiality and security controls.
                </p>
              </section>
              <section>
                <h2 className="text-white text-lg font-semibold mb-2">Data Retention</h2>
                <p>
                  We retain data only as long as needed to operate services, meet legal obligations, and resolve disputes.
                  You can request removal of your contact data by emailing us.
                </p>
              </section>
              <section>
                <h2 className="text-white text-lg font-semibold mb-2">Contact</h2>
                <p>
                  For privacy requests, email <a className="text-[#0ea5e9] hover:text-[#38bdf8]" href="mailto:rigovivas71@gmail.com">rigovivas71@gmail.com</a>.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-7 text-[#cbd5e1] text-sm leading-relaxed">
              <section>
                <h2 className="text-white text-lg font-semibold mb-2">Service Scope</h2>
                <p>
                  GMX Audit Control Center provides digital B2B engineering and security support services, including CI
                  monitoring, regression coverage, alerting, issue triage, and audit-oriented operational support.
                </p>
              </section>
              <section>
                <h2 className="text-white text-lg font-semibold mb-2">Billing</h2>
                <p>
                  Recurring plans are billed monthly through Stripe unless otherwise agreed in writing. One-time scoped
                  engagements are invoiced or charged per agreed terms.
                </p>
              </section>
              <section>
                <h2 className="text-white text-lg font-semibold mb-2">Refund Policy</h2>
                <p>
                  Monthly service fees are generally non-refundable once a billing cycle begins and service capacity has
                  been allocated. If a billing error occurs, contact us within 14 days and we will review and correct valid
                  overcharges. For one-time engagements, refund eligibility depends on the signed scope and delivery status.
                </p>
              </section>
              <section>
                <h2 className="text-white text-lg font-semibold mb-2">Limitation of Liability</h2>
                <p>
                  Services are provided on a best-effort basis for operational support and do not constitute legal,
                  investment, or insurance guarantees. Liability is limited to the amount paid for services in the prior
                  three months, to the extent permitted by law.
                </p>
              </section>
              <section>
                <h2 className="text-white text-lg font-semibold mb-2">Contact</h2>
                <p>
                  For terms questions, email <a className="text-[#0ea5e9] hover:text-[#38bdf8]" href="mailto:rigovivas71@gmail.com">rigovivas71@gmail.com</a>.
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function getLegalRouteFromHash(hash: string): LegalPageType | null {
  const value = hash.toLowerCase();
  if (value.startsWith('#/privacy')) return 'privacy';
  if (value.startsWith('#/terms')) return 'terms';
  return null;
}

export default function Landing({ onNavigate, locale }: LandingProps) {
  const content = LANDING_CONTENT[locale];
  const [legalPage, setLegalPage] = useState<LegalPageType | null>(() =>
    typeof window === 'undefined' ? null : getLegalRouteFromHash(window.location.hash)
  );
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setLegalPage(getLegalRouteFromHash(window.location.hash));
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (legalPage) return;

    const handleScroll = () => {
      const heroEl = document.getElementById('hero');
      const threshold = heroEl ? heroEl.offsetHeight - 120 : window.innerHeight * 0.8;
      setShowStickyCta(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [legalPage]);

  if (legalPage) {
    return <LegalPage page={legalPage} onNavigate={onNavigate} />;
  }

  return (
    <>
      <Navbar currentPage="home" onNavigate={onNavigate} locale={locale} strings={LOCALE_BUNDLES[locale].strings.nav} />
      <main className="bg-slate-950 pb-24 md:pb-0" role="main" aria-label="GMX Audit Control Center homepage">
        <section className="bg-slate-950 px-4 pt-20 sm:px-6">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-end gap-2 text-xs text-slate-300">
            <span className="text-slate-400">{content.languageLabel}</span>
            <a className={locale === 'en' ? 'font-semibold text-cyan-400' : 'hover:text-white'} href={`${import.meta.env.BASE_URL}en/`}>EN</a>
            <span>/</span>
            <a className={locale === 'es' ? 'font-semibold text-cyan-400' : 'hover:text-white'} href={`${import.meta.env.BASE_URL}es/`}>ES</a>
            <span>/</span>
            <a className={locale === 'fr' ? 'font-semibold text-cyan-400' : 'hover:text-white'} href={`${import.meta.env.BASE_URL}fr/`}>FR</a>
          </div>
        </section>
        <HeroSection content={content} />
        <DashboardProofSection content={content} />
        <ValueSection content={content} />
        <PricingSection content={content} />
        <HowItWorksSection content={content} />
        <TrustStripSection content={content} />
        <FAQSection content={content} />
        <ContactSection content={content} />
      </main>
      <SiteFooter content={content} />
      {showStickyCta && <StickyMobileCTA content={content} />}
    </>
  );
}
