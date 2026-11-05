/*
 * Sigles et abréviations développés dans les pages (WCAG 3.1.4, exigé par le
 * SGQRI 008 3.0). Le plugin src/plugins/rehype-abreviations.mjs entoure la
 * première occurrence de chacun, dans chaque page, d'un
 * <abbr title="forme développée">.
 *
 * Pour en ajouter un : une ligne ici, en respectant la casse du sigle.
 * Exclus volontairement :
 * - UdeM, HEC, UQAM, Campus MIL : noms d'établissements, connus ;
 * - noms et modèles de produits (OBS, SPSS, QDA Miner, Sennheiser HD 280…) ;
 * - sigles ambigus selon la page (PC : ordinateur ou polycarbonate ; CA, BB…).
 */
export const ABREVIATIONS = {
  // Lieux et services
  AVA: 'Apportez votre appareil',
  BLSH: 'Bibliothèque des lettres et sciences humaines',
  LSH: 'lettres et sciences humaines',
  SIUM: "Service d'impression de l'Université de Montréal",
  STIC: 'Frais d’amélioration des services technologiques et informatiques et des collections des bibliothèques',
  TGD: 'Thérèse-Gouin-Décarie',
  TI: "technologies de l'information",

  // Accessibilité
  SGQRI: 'Standard du gouvernement du Québec sur les ressources informationnelles',
  WCAG: 'Web Content Accessibility Guidelines (règles pour l’accessibilité des contenus Web)',

  // Informatique et réseau
  A2F: 'authentification à deux facteurs',
  DNS: 'système de noms de domaine',
  EAP: 'Extensible Authentication Protocol',
  IDE: 'environnement de développement intégré',
  IP: 'protocole Internet',
  NIP: "numéro d'identification personnel",
  OCR: 'reconnaissance optique de caractères',
  PEAP: 'Protected Extensible Authentication Protocol',
  PR: 'pull request (demande de fusion)',
  RAM: 'mémoire vive',
  SSD: 'disque électronique (solid-state drive)',
  TCP: 'Transmission Control Protocol',
  URL: 'adresse Web (Uniform Resource Locator)',
  VPN: 'réseau privé virtuel',
  VRAM: 'mémoire vive de la carte graphique',

  // Connectique, supports et formats
  NTSC: 'National Television System Committee (norme vidéo nord-américaine)',
  PAL: 'Phase Alternating Line (norme vidéo européenne)',
  STL: 'stéréolithographie (format de modèle 3D)',
  SVG: 'Scalable Vector Graphics',
  WAV: 'Waveform Audio File Format',

  // Image, son et vidéo
  DEL: 'diode électroluminescente',
  DIP: 'distance interpupillaire',
  EQ: 'égalisation',
  FPS: "images par seconde (frames per second)",
  LCD: 'écran à cristaux liquides',
  LUTs: 'tables de correspondance des couleurs (look-up tables)',
  MAO: 'musique assistée par ordinateur',
  PCM: 'modulation par impulsions codées',
  RGB: 'rouge, vert, bleu (red, green, blue)',
  RVB: 'rouge, vert, bleu',
  UHD: 'ultra-haute définition',
  VR: 'réalité virtuelle',

  // Électronique
  RFID: 'identification par radiofréquence',
  RX: 'réception',
  TX: 'transmission',

  // Impression 3D
  ABS: 'acrylonitrile butadiène styrène',
  AMS: 'Automatic Material System (changeur automatique de bobines)',
  ASA: 'acrylonitrile styrène acrylate',
  BVOH: 'copolymère butènediol-alcool vinylique',
  CPE: 'copolyester',
  HIPS: 'polystyrène choc',
  PEI: 'polyétherimide',
  PETG: 'polyéthylène téréphtalate glycolisé',
  PLA: 'acide polylactique',
  PVA: 'alcool polyvinylique',
  PVB: 'polyvinylbutyral',

  // Jeux et licences
  CC: 'Creative Commons',
  RPG: 'jeu de rôle (role-playing game)',
}
