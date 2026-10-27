export type Language = 'en' | 'or';

export const LANG_STORAGE_KEY = 'shopbujo_hatto_lang_v1';

export const TRANSLATIONS = {
  en: {
    home: 'Home',
    shopAll: 'Shop All',
    vegetables: 'Vegetables',
    fruits: 'Fruits',
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    faq: 'FAQ',
    cart: 'Cart',
    checkout: 'Checkout',
    search: 'Search',
    searchPlaceholder: 'Search fresh vegetables, fruits, or greens...',
    allProduce: 'All Produce',
    available: 'Available',
    unavailable: 'Currently Unavailable',
    addToCart: 'Add to Cart',
    addedToCart: 'Added to Cart',
    kg: 'kg',
    piece: 'piece',
    bundle: 'bundle',
    unitUnconfirmed: 'unit unconfirmed',
    subtotal: 'Subtotal',
    estimatedTotal: 'Estimated Total',
    freeDelivery: 'Free Delivery',
    deliveryCharge: 'Delivery Charge',
    previewCheckoutDisclaimer:
      'Frontend preview only — online order submission activates after backend connection.',
    emptyCartTitle: 'Your shopping cart is empty',
    emptyCartBody:
      'Looks like you have not added any fresh produce yet. Explore our local vegetables and fruits!',
    continueShopping: 'Explore Produce',
    clearCart: 'Clear Cart',
    proceedToCheckout: 'Proceed to Checkout',
    reviewCart: 'Review Cart',

    // Coupon & delivery strings
    applyCoupon: 'Apply Coupon Code',
    couponPlaceholder: 'Enter coupon code (e.g. SHOP50)',
    apply: 'Apply',
    removeCoupon: 'Remove coupon',
    couponSuccess: 'Coupon applied! You saved ₹50.',
    couponMinSpend: 'Add items worth ₹999 to use this coupon.',
    couponInvalid: 'This coupon code is invalid.',
    discount: 'Coupon Discount',

    // Homepage Hero & Sections
    heroHeading: 'Organic Vegetables for a Healthy Life',
    shopNow: 'Shop Now',
    shop: 'Shop',
    exploreByCategory: 'Explore by Category',
    exploreCategorySubtitle: 'Carefully sorted produce for your kitchen staples.',
    viewAll54Items: 'View All Produce',
    freshVegetablesAndGreens: 'Fresh Vegetables & Greens',
    itemsCountVeg: 'Vegetables & Tubers',
    vegetablesSubtitle:
      'Potatoes, ridge gourds, brinjals, cauliflowers, fresh ginger, garlic, and local leafy bunches.',
    browseVegetables: 'Browse Vegetables',
    seasonalAndEverydayFruits: 'Seasonal & Everyday Fruits',
    itemsCountFruits: 'Seasonal Fruits',
    fruitsSubtitle:
      'Shimla & Kashmiri apples, pomegranates, sweet Champa bananas, orangeries, and juicy watermelons.',
    exploreFruits: 'Explore Fruits',
    featuredProduce: 'Featured Fresh Produce',
    featuredSubtitle: 'Available staples selected directly from our local catalogue.',
    viewAll: 'View All',
    popularStaples: 'Popular Everyday Staples',
    popularSubtitle: 'Everyday essentials every home relies on for daily curries and meals.',
    howItWorksTitle: 'How Shopping Works at Sabuja Haata',
    howItWorksSubtitle:
      'Straightforward, transparent grocery ordering designed for local households.',
    step1Title: 'Browse and Pick',
    step1Desc: 'Choose fresh local produce.',
    step2Title: 'Review Your Basket',
    step2Desc: 'Check clear item prices.',
    step3Title: 'Confirm and Receive',
    step3Desc:
      'Select your preferred delivery time slot for fast, careful handling straight to your doorstep.',
    faqsTitle: 'Frequently Asked Questions',
    faqsSubtitle:
      'Key details about produce pricing, fractional weights, and shopping.',
    readAllFaqs: 'Read all store FAQs →',
    finalCtaTitle: 'Ready to stock your kitchen with fresh produce?',
    finalCtaDesc:
      'Browse our full catalogue of vegetables, leafy greens, and seasonal fruits at transparent local rates.',
    finalCtaShop: 'Shop All Produce',
    finalCtaAbout: 'About Our Store',

    // Footer
    footerProduceCategories: 'Produce Categories',
    footerStoreInfo: 'Store Information',
    footerStorePolicies: 'Store Policies',
    footerOperatingHours: 'Operating Hours:',
    footerDeliveryPolicy: 'Delivery Policy',
    footerReturnPolicy: 'Return & Refund',
    footerPrivacyPolicy: 'Privacy Policy',
    footerTermsConditions: 'Terms & Conditions',
    footerCookiePolicy: 'Cookie Policy',
    footerCheckoutPreview: 'Checkout Preview',
    footerRights: 'All rights reserved.',
  },
  or: {
    home: 'ମୂଳପୃଷ୍ଠା',
    shopAll: 'ସମସ୍ତ ସାମଗ୍ରୀ',
    vegetables: 'ପନିପରିବା',
    fruits: 'ଫଳ',
    aboutUs: 'ଆମ ବିଷୟରେ',
    contactUs: 'ଯୋଗାଯୋଗ',
    faq: 'ପ୍ରଶ୍ନୋତ୍ତର',
    cart: 'ଝୁଡ଼ି',
    checkout: 'ଚେକ୍ଆଉଟ୍',
    search: 'ଖୋଜନ୍ତୁ',
    searchPlaceholder: 'ତାଜା ପରିବା, ଫଳ ବା ଶାଗ ଖୋଜନ୍ତୁ...',
    allProduce: 'ସମସ୍ତ ପରିବା ଓ ଫଳ',
    available: 'ଉପଲବ୍ଧ',
    unavailable: 'ବର୍ତ୍ତମାନ ଉପଲବ୍ଧ ନାହିଁ',
    addToCart: 'ଝୁଡ଼ିରେ ଯୋଡ଼ନ୍ତୁ',
    addedToCart: 'ଯୋଡ଼ାଗଲା',
    kg: 'କେଜି',
    piece: 'ଖଣ୍ଡ',
    bundle: 'ବିଡ଼ା',
    unitUnconfirmed: 'ନିର୍ଦ୍ଦିଷ୍ଟ ଏକକ',
    subtotal: 'ମୋଟ ମୂଲ୍ୟ',
    estimatedTotal: 'ଆନୁମାନିକ ମୋଟ',
    freeDelivery: 'ମାଗଣା ଡେଲିଭରୀ',
    deliveryCharge: 'ଡେଲିଭରୀ ଶୁଳ୍ପ',
    previewCheckoutDisclaimer:
      'ଫ୍ରଣ୍ଟଏଣ୍ଡ୍ ପ୍ରଦର୍ଶନ ମାତ୍ର — ବ୍ୟାକଏଣ୍ଡ୍ ସଂଯୋଗ ପରେ ଅର୍ଡର ସକ୍ରିୟ ହେବ।',
    emptyCartTitle: 'ଆପଣଙ୍କ ଝୁଡ଼ି ଖାଲି ଅଛି',
    emptyCartBody:
      'ଆପଣ ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ତାଜା ପରିବା ବା ଫଳ ବାଛି ନାହାଁନ୍ତି। ଆମ କାଟାଲଗ୍ ଦେଖନ୍ତୁ!',
    continueShopping: 'ପରିବା ଦେଖନ୍ତୁ',
    clearCart: 'ଝୁଡ଼ି ଖାଲି କରନ୍ତୁ',
    proceedToCheckout: 'ଚେକ୍ଆଉଟ୍ କରନ୍ତୁ',
    reviewCart: 'ଝୁଡ଼ି ଦେଖନ୍ତୁ',

    // Coupon & delivery strings
    applyCoupon: 'କୂପନ୍ କୋଡ୍ ପ୍ରୟୋଗ କରନ୍ତୁ',
    couponPlaceholder: 'କୂପନ୍ କୋଡ୍ ଦିଅନ୍ତୁ (ଯଥା SHOP50)',
    apply: 'ପ୍ରୟୋଗ କରନ୍ତୁ',
    removeCoupon: 'କୂପନ୍ ବାହାର କରନ୍ତୁ',
    couponSuccess: 'କୂପନ୍ ପ୍ରୟୋଗ ହେଲା! ଆପଣ ₹୫୦ ସଞ୍ଚୟ କଲେ।',
    couponMinSpend: 'ଏହି କୂପନ୍ ବ୍ୟବହାର କରିବାକୁ ଅତିକମ୍ରେ ₹୯୯୯ ର ସାମଗ୍ରୀ ଯୋଡ଼ନ୍ତୁ।',
    couponInvalid: 'ଏହି କୂପନ୍ କୋଡ୍ଟି ଅବୈଧ ଅଟେ।',
    discount: 'କୂପନ୍ ଛାଡ଼',

    // Homepage Hero & Sections
    heroHeading: 'ଜୀବନର ସୁସ୍ଥତା ପାଇଁ ଜୈବିକ ପନିପରିବା',
    shopNow: 'କିଣନ୍ତୁ',
    shop: 'କିଣନ୍ତୁ',
    exploreByCategory: 'ବର୍ଗ ଅନୁସାରେ ଦେଖନ୍ତୁ',
    exploreCategorySubtitle: 'ଆପଣଙ୍କ ରୋଷେଇ ଘର ପାଇଁ ଯତ୍ନର ସହ ବଛାଯାଇଥିବା ସାମଗ୍ରୀ।',
    viewAll54Items: 'ସମସ୍ତ ସାମଗ୍ରୀ ଦେଖନ୍ତୁ',
    freshVegetablesAndGreens: 'ତାଜା ପନିପରିବା ଓ ଶାଗ',
    itemsCountVeg: 'ପନିପରିବା',
    vegetablesSubtitle:
      'ଆଳୁ, ଜାହ୍ନି, ବାଇଗଣ, ଫୁଲକୋବି, ତାଜା ଅଦା, ରସୁଣ ଏବଂ ସ୍ଥାନୀୟ ଶାଗ ବିଡ଼ା।',
    browseVegetables: 'ପରିବା ଦେଖନ୍ତୁ',
    seasonalAndEverydayFruits: 'ଋତୁକାଳୀନ ଓ ନିତ୍ୟ ଫଳ',
    itemsCountFruits: 'ଫଳ',
    fruitsSubtitle:
      'ଶିମଲା ଓ କାଶ୍ମୀରୀ ସେଓ, ଡାଳିମ୍ବ, ଚମ୍ପା କଦଳୀ, କମଳା ଏବଂ ତରଭୁଜ।',
    exploreFruits: 'ଫଳ ଦେଖନ୍ତୁ',
    featuredProduce: 'ବିଶେଷ ତାଜା ସାମଗ୍ରୀ',
    featuredSubtitle: 'ଆମ ସ୍ଥାନୀୟ କାଟାଲଗ୍‌ରୁ ଚୟନିତ ସାମଗ୍ରୀ।',
    viewAll: 'ସମସ୍ତ ଦେଖନ୍ତୁ',
    popularStaples: 'ଲୋକପ୍ରିୟ ନିତ୍ୟ ସାମଗ୍ରୀ',
    popularSubtitle: 'ପ୍ରତିଦିନର ତରକାରୀ ଓ ଖାଦ୍ୟ ପାଇଁ ଆବଶ୍ୟକୀୟ ଜିନିଷ।',
    howItWorksTitle: 'ସବୁଜ ହାଟରେ କିପରି ସାମଗ୍ରୀ ବାଛିବେ',
    howItWorksSubtitle:
      'ସ୍ଥାନୀୟ ପରିବାରଙ୍କ ପାଇଁ ସରଳ ଓ ସ୍ପଷ୍ଟ ସାମଗ୍ରୀ ଚୟନ।',
    step1Title: 'ପସନ୍ଦ କରନ୍ତୁ ଓ ଓଜନ ବାଛନ୍ତୁ',
    step1Desc:
      'ସ୍ଥାନୀୟ ସାମଗ୍ରୀ ଦେଖନ୍ତୁ। ୦.୨୫ କେଜି ବା ଗୋଟା/ବିଡ଼ା ହିସାବରେ ବାଛନ୍ତୁ।',
    step2Title: 'ଆପଣଙ୍କ ଝୁଡ଼ି ଯାଞ୍ଚ କରନ୍ତୁ',
    step2Desc:
      'ସଠିକ୍ ଓ ସ୍ପଷ୍ଟ ସ୍ଥାନୀୟ ମୂଲ୍ୟ ଯାଞ୍ଚ କରନ୍ତୁ।',
    step3Title: 'ନିଶ୍ଚିତ କରନ୍ତୁ ଓ ପାଆନ୍ତୁ',
    step3Desc:
      'ଘର ପାଖରେ ସତେଜ ସାମଗ୍ରୀ ପାଇବାକୁ ଉପଯୁକ୍ତ ସମୟ ବାଛନ୍ତୁ।',
    faqsTitle: 'ବାରମ୍ବାର ପଚରାଯାଉଥିବା ପ୍ରଶ୍ନ',
    faqsSubtitle:
      'ଆମ ମୂଲ୍ୟ, ଓଜନ ଏବଂ ପ୍ରଦର୍ଶନ ବିଷୟରେ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ସୂଚନା।',
    readAllFaqs: 'ସମସ୍ତ ପ୍ରଶ୍ନୋତ୍ତର ପଢ଼ନ୍ତୁ →',
    finalCtaTitle: 'ଆପଣଙ୍କ ରୋଷେଇ ଘର ପାଇଁ ତାଜା ସାମଗ୍ରୀ ଆଣିବାକୁ ପ୍ରସ୍ତୁତ କି?',
    finalCtaDesc:
      'ସ୍ୱଚ୍ଛ ଦରରେ ପରିବା, ଶାଗ ଏବଂ ଋତୁକାଳୀନ ଫଳର ସମ୍ପୂର୍ଣ୍ଣ କାଟାଲଗ୍ ଦେଖନ୍ତୁ।',
    finalCtaShop: 'ସମସ୍ତ ସାମଗ୍ରୀ ଦେଖନ୍ତୁ',
    finalCtaAbout: 'ଆମ ଦୋକାନ ବିଷୟରେ',

    // Footer
    footerProduceCategories: 'ଉତ୍ପାଦ ବର୍ଗ',
    footerStoreInfo: 'ଦୋକାନ ସୂଚନା',
    footerStorePolicies: 'ନିୟମାବଳୀ',
    footerOperatingHours: 'ଖୋଲିବା ସମୟ:',
    footerDeliveryPolicy: 'ଡେଲିଭରୀ ନୀତି',
    footerReturnPolicy: 'ଫେରସ୍ତ ନୀତି',
    footerPrivacyPolicy: 'ଗୋପନୀୟତା ନୀତି',
    footerTermsConditions: 'ନିୟମ ଓ ସର୍ତ୍ତାବଳୀ',
    footerCookiePolicy: 'କୁକିଜ୍ ନୀତି',
    footerCheckoutPreview: 'ଚେକ୍ଆଉଟ୍ ପ୍ରଦର୍ଶନ',
    footerRights: 'ସର୍ବସ୍ୱତ୍ୱ ସଂରକ୍ଷିତ।',
  },
};

export function formatSellingUnit(unit: string, lang: Language): string {
  if (lang === 'or') {
    if (unit === 'kg') return 'କେଜି';
    if (unit === 'piece') return 'ଖଣ୍ଡ';
    if (unit === 'bundle') return 'ବିଡ଼ା';
    return 'ଏକକ';
  }
  return unit;
}
