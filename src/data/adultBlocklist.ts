// Comprehensive blocklist for adult content
// This list is used by the VPN service for DNS filtering

// Blocked keywords (English)
export const adultKeywordsEn: string[] = [
  'porn',
  'xxx',
  'adult',
  'nude',
  'naked',
  'sex',
  'erotic',
  'nsfw',
  'explicit',
  'mature',
  'hentai',
  'fetish',
  'stripper',
  'escort',
  'camgirl',
  'onlyfans',
  'livecam',
  'webcam',
  'hookup',
  'fling',
  'booty',
  'milf',
  'teen',
  'twink',
  'lesbian',
  'gay',
  'transgender',
  'tranny',
  'shemale',
  'bdsm',
  'bondage',
  'kink',
  'slutty',
  'horny',
  'pussy',
  'dick',
  'cock',
  'penis',
  'vagina',
  'anal',
  'blowjob',
  'handjob',
  'masturbat',
  'orgasm',
  'cumshot',
  'creampie',
  'gangbang',
  'threesome',
  'foursome',
  'orgy',
  'swinger',
  'cuckold',
  'voyeur',
  'peeping',
  'upskirt',
  'downblouse',
  'nipple',
  'tit',
  'boob',
  'breast',
  'areola',
  'butt',
  'ass',
  'arse',
  'panties',
  'lingerie',
  'thong',
  'bikini',
  'topless',
  'bottomless',
  'naughty',
  'dirty',
  'filthy',
  'slutload',
  'redtube',
  'youporn',
  'xvideos',
  'xnxx',
  'xhamster',
  'pornhub',
  'brazzers',
  'bangbros',
  'realitykings',
  'naughtyamerica',
  'twistys',
  'digitalplayground',
  'fakehub',
  'mofos',
  'babes',
  'spankbang',
  'eporner',
  'tube8',
  'xtube',
  'motherless',
  'imagefap',
  'rule34',
  'e621',
  'gelbooru',
  'danbooru',
  'sankaku',
  'nhentai',
  'hanime',
  'hentaihaven',
  'fakku',
];

// Blocked keywords (Arabic)
export const adultKeywordsAr: string[] = [
  'اباحي',
  'اباحية',
  'عري',
  'جنس',
  'سكس',
  'للكبار',
  'بورن',
  'نيك',
  'زب',
  'كس',
  'طيز',
  'بزاز',
  'شرموطة',
  'عاهرة',
  'قحبة',
  'منيك',
  'لواط',
  'سحاق',
  'زنا',
  'فاحشة',
  'عورة',
  'خليع',
  'فاضح',
  'مثير',
  'ساخن',
];

// Combined keywords
export const allAdultKeywords: string[] = [...adultKeywordsEn, ...adultKeywordsAr];

// Blocked domains - comprehensive list of adult sites
export const adultDomains: string[] = [
  // Major adult video sites
  'pornhub.com',
  'xvideos.com',
  'xnxx.com',
  'xhamster.com',
  'redtube.com',
  'youporn.com',
  'tube8.com',
  'spankbang.com',
  'eporner.com',
  'beeg.com',
  'porn.com',
  'thumbzilla.com',
  'porntrex.com',
  'txxx.com',
  'hclips.com',
  'hdzog.com',
  'drtuber.com',
  'pornone.com',
  'porndig.com',
  'pornrox.com',
  'porn300.com',
  'pornhat.com',
  'fuq.com',
  'nudevista.com',
  'tnaflix.com',
  'pornmd.com',
  'alohatube.com',
  'fapster.xxx',
  'sunporno.com',
  'gotporn.com',
  'anyporn.com',
  'zbporn.com',
  'analdin.com',
  'porno365.com',
  'porngo.com',
  'vporn.com',
  'pornoxo.com',

  // Premium/paid sites
  'brazzers.com',
  'bangbros.com',
  'realitykings.com',
  'naughtyamerica.com',
  'digitalplayground.com',
  'twistys.com',
  'fakehub.com',
  'mofos.com',
  'babes.com',
  'wicked.com',
  'vixen.com',
  'blacked.com',
  'tushy.com',
  'deeper.com',
  'slayed.com',
  'adulttime.com',
  'pornpros.com',
  'teamskeet.com',
  'mylf.com',
  'sislovesme.com',
  'familystrokes.com',
  'propertyxxx.com',
  'passionhd.com',
  'exotic4k.com',
  'puremature.com',
  'holed.com',
  'fantasyhd.com',
  'castingcouch-x.com',
  'cum4k.com',

  // Hentai/anime
  'hanime.tv',
  'hentaihaven.xxx',
  'nhentai.net',
  'hentai2read.com',
  'fakku.net',
  'tsumino.com',
  'e-hentai.org',
  'hitomi.la',
  'simply-hentai.com',
  'hentaigasm.com',
  'muchohentai.com',
  'hentaihere.com',
  'cartoon-sex.xxx',

  // Image boards
  'rule34.xxx',
  'rule34.paheal.net',
  'gelbooru.com',
  'danbooru.donmai.us',
  'e621.net',
  'sankakucomplex.com',
  'imagefap.com',
  'motherless.com',

  // Cam sites
  'chaturbate.com',
  'stripchat.com',
  'livejasmin.com',
  'bongacams.com',
  'myfreecams.com',
  'cam4.com',
  'camsoda.com',
  'flirt4free.com',
  'streamate.com',
  'imlive.com',
  'jerkmate.com',
  'camster.com',
  'xcams.com',

  // Dating/hookup sites
  'ashleymadison.com',
  'adultfriendfinder.com',
  'fling.com',
  'onenightfriend.com',
  'benaughty.com',
  'flirt.com',
  'together2night.com',
  'naughtydate.com',

  // OnlyFans and similar
  'onlyfans.com',
  'fansly.com',
  'fancentro.com',
  'loyalfans.com',
  'manyvids.com',
  'clips4sale.com',
  'modelhub.com',
  'pornhubpremium.com',

  // Forums and communities
  'literotica.com',
  'reddit.com/r/nsfw',
  'reddit.com/r/gonewild',
  'nifty.org',
  'sexstories.com',
  'xnxx.com/forum',

  // Escort/prostitution sites
  'eros.com',
  'escortbabylon.net',
  'cityxguide.com',
  'bedpage.com',
  'skipthegames.com',
  'rubmaps.ch',
  'usasexguide.nl',

  // Adult ad networks and CDNs
  'exoclick.com',
  'trafficjunky.com',
  'juicyads.com',
  'ero-advertising.com',
  'plugrush.com',
  'trafficfactory.biz',
  'adxpansion.com',
  'awempire.com',

  // Safe search bypass domains
  'bing.com/images',
  'duckduckgo.com/images',

  // VPN/proxy sites often used to bypass filters
  'hide.me',
  'proxysite.com',
  'hidester.com',
  'kproxy.com',
  'whoer.net',
  'croxyproxy.com',

  // NSFW Reddit alternatives
  'scrolller.com',
  'redgifs.com',

  // Adult games
  'nutaku.net',
  'lewdgames.com',
  'f95zone.to',

  // Misc adult content
  'leakedbb.com',
  'celebjihad.com',
  'thefappeningblog.com',
  'fapello.com',
  'coomer.party',
  'kemono.party',
];

// Gambling keywords (English)
export const gamblingKeywordsEn: string[] = [
  'casino',
  'gambling',
  'betting',
  'poker',
  'slots',
  'blackjack',
  'roulette',
  'baccarat',
  'craps',
  'keno',
  'lottery',
  'scratch',
  'sportsbet',
  'bookmaker',
  'odds',
  'wager',
  'jackpot',
  'spin',
  'lucky',
  'vegas',
];

// Gambling keywords (Arabic)
export const gamblingKeywordsAr: string[] = [
  'قمار',
  'كازينو',
  'مراهنات',
  'بوكر',
  'يانصيب',
  'روليت',
  'سلوتس',
  'رهان',
  'حظ',
];

// Combined gambling keywords
export const allGamblingKeywords: string[] = [...gamblingKeywordsEn, ...gamblingKeywordsAr];

// Gambling domains
export const gamblingDomains: string[] = [
  'bet365.com',
  'draftkings.com',
  'fanduel.com',
  'betway.com',
  'unibet.com',
  'williamhill.com',
  'paddypower.com',
  'betfair.com',
  '888casino.com',
  'pokerstars.com',
  'partypoker.com',
  'bovada.lv',
  'betonline.ag',
  'mybookie.ag',
  'stake.com',
  'roobet.com',
  'bcgame.com',
  'cloudbet.com',
];

// Default distracting app packages (social media)
export const distractingAppPackages: string[] = [
  'com.instagram.android',
  'com.zhiliaoapp.musically', // TikTok
  'com.twitter.android',
  'com.facebook.katana',
  'com.snapchat.android',
  'com.google.android.youtube',
  'com.reddit.frontpage',
  'com.pinterest',
  'com.tumblr',
  'com.discord',
  'tv.twitch.android.app',
];

// Check if a URL contains any blocked keywords
export const containsBlockedKeyword = (
  url: string,
  keywords: string[] = allAdultKeywords
): boolean => {
  const lowerUrl = url.toLowerCase();
  return keywords.some((keyword) => lowerUrl.includes(keyword.toLowerCase()));
};

// Check if a domain is in the blocklist
export const isDomainBlocked = (
  domain: string,
  blockedDomains: string[] = adultDomains
): boolean => {
  const lowerDomain = domain.toLowerCase();
  return blockedDomains.some((blocked) =>
    lowerDomain === blocked.toLowerCase() ||
    lowerDomain.endsWith('.' + blocked.toLowerCase())
  );
};

// Check if a URL should be blocked
export const shouldBlockUrl = (
  url: string,
  customKeywords: string[] = [],
  customDomains: string[] = []
): { blocked: boolean; reason?: string } => {
  const allKeywords = [...allAdultKeywords, ...customKeywords];
  const allDomains = [...adultDomains, ...customDomains];

  // Check keywords
  if (containsBlockedKeyword(url, allKeywords)) {
    return { blocked: true, reason: 'keyword' };
  }

  // Extract domain from URL
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (isDomainBlocked(urlObj.hostname, allDomains)) {
      return { blocked: true, reason: 'domain' };
    }
  } catch {
    // Invalid URL, check as-is
    if (isDomainBlocked(url, allDomains)) {
      return { blocked: true, reason: 'domain' };
    }
  }

  return { blocked: false };
};

export default {
  adultKeywordsEn,
  adultKeywordsAr,
  allAdultKeywords,
  adultDomains,
  gamblingKeywordsEn,
  gamblingKeywordsAr,
  allGamblingKeywords,
  gamblingDomains,
  distractingAppPackages,
  containsBlockedKeyword,
  isDomainBlocked,
  shouldBlockUrl,
};
