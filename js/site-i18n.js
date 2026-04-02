/* ================================================================
   GLAZED OVER MINI DONUTS — Internationalisation (i18n)
   Supported languages: English (en) | Spanish (es)
   ================================================================
   To add a new language:
     1. Duplicate the 'es' block inside TRANSLATIONS and change the
        key to your two-letter language code (e.g. 'fr' for French).
     2. Replace all the string values with your translations.
     3. Add a button or option to the lang-toggle in index.html
        pointing to your new language code.
   ================================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'gom-lang';
  var storage = window.GOMStorage;

  function getStoredLang() {
    if (storage) return storage.getItem(STORAGE_KEY, 'preferences');
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveLang(lang) {
    if (storage) return storage.setItem(STORAGE_KEY, lang, 'preferences');
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      return true;
    } catch (error) {
      return false;
    }
  }

  function getCurrentLangPref() {
    return document.documentElement.getAttribute('lang') || getStoredLang() || ((window.SiteConfig && window.SiteConfig.defaultLang) || 'en');
  }

  /* ---- Translations ------------------------------------------- */
  var TRANSLATIONS = {

    en: {
      /* Accessibility */
      skip_link: 'Skip to main content',
      meta_title_home: 'Glazed Over Mini Donuts | Groovy Donuts, Phoenix West Valley',
      meta_title_about: 'About Ashley | Glazed Over Mini Donuts',
      meta_title_menu: 'Far Out Menu | Glazed Over Mini Donuts',
      meta_title_contact: 'Contact & Events | Glazed Over Mini Donuts',
        meta_title_404: '404 | Glazed Over Mini Donuts',
      nav_logo_home_aria: 'Glazed Over Mini Donuts — Home',
      nav_toggle_label: 'Toggle menu',
      back_to_top: 'Back to top',
      scroll_down: 'Scroll down',
      leave_site_confirm: 'Are you sure you want to go to {link}? You will be leaving this site.',
      leave_site_eyebrow: 'External link',
      leave_site_title: 'Leaving Glazed Over Mini Donuts',
      leave_site_body: 'Are you sure you want to go to {link}?',
      leave_site_notice: 'You will be leaving this site.',
      leave_site_destination: 'Destination',
      leave_site_stay: 'Stay here',
      leave_site_leave: 'Leave site',

      /* Nav */
      nav_home:    'Home',
      nav_menu:    'Menu',
      nav_about:   'About',
      nav_contact: 'Contact',
      nav_legal:   'Legal',

      /* Hero */
      loading_home:          'Glazing it up…',
      loading_about:         'Just a sec…',
      loading_menu:          'Loading the menu…',
      loading_contact:       'Rolling in…',
        loading_404:          'Looking for the right batch…',
      hero_badge:            'Now Rolling Through Phoenix West Valley',
      hero_heading:          '<span class="word-groovy">Groovy</span><br>Donuts Made<br><span class="line-highlight">the Right Way</span>',
      hero_desc:             'Fresh, made-to-order mini donuts fried in real beef tallow — no artificial colors. Just peace, love, and buckets full of joy. ✌️❤️🍩',
      hero_cta_menu:         '🍩 See Our Flavors',
      hero_cta_truck:        'Come Find Us',
      hero_badge_oils:       'No Artificial Colors',
      hero_badge_ingredients:'Real Ingredients',
      hero_badge_mto:        'Made to Order',
      marquee_item1:         'Fried in Beef Tallow',
      marquee_item2:         'No Artificial Colors',
      marquee_item3:         'Made to Order',
      marquee_item4:         'Real Ingredients',
      marquee_item5:         'No Artificial Colors',
      marquee_item6:         'Phoenix West Valley',
      marquee_item7:         '✌️ Peace Love Donuts 🍩',
      marquee_item8:         'Groovy Glazes',
      marquee_item9:         'Buckets of Joy',

      /* Ingredients */
      ingredients_label:    'Real Deal Since Day One',
      ingredients_title:    'Old School <span>Quality</span>,<br>No Shortcuts',
      ingredients_body:     'Old-school donuts made with beef tallow, real ingredients, and no artificial colors.',
      ingredients_cta:      'Our Story',
      chip_tallow:          'Beef Tallow Fried',
      chip_oils:            'Groovy Flavor',
      chip_colors:          'No Artificial Colors',
      chip_real:            'Real Ingredients Only',
      chip_mto:             'Made to Order',
      chip_soul:            'Made with Soul',
      card_back_eyebrow:    'Why They Hit Different',
      card_back_text:       '<span class="card-back-line"><span class="card-back-main">Old-school frying</span><span class="card-back-sub">Made with beef tallow</span></span><span class="card-back-line"><span class="card-back-main">Real Ingredients</span><span class="card-back-sub">Made fresh to order</span></span><span class="card-back-line"><span class="card-back-main">Made to Order</span><span class="card-back-sub">Fresh like our groovy vibes</span></span>',
      card_back_pill1:      '100% Beef Tallow',
      card_back_pill2:      'No Artificial Colors',
      card_back_pill3:      'Made Fresh to Order',
      card_fried_in:        'Fried In',
      card_tallow:          'Beef Tallow',
      card_oils_label:      'Seed Oils Used',
      card_oils_val:        'Some flavors may include them.',
      card_promise_label:   'Our Promise',
      card_promise_val:     'Old-School Good',
      card_quote:           '"Just groovy donuts made the way they used to be." ✌️',

      /* Flavors */
      flavors_label:    'Far Out Flavors',
      flavors_title:    'Pick Your <span>Glaze</span>',
      flavors_subtitle: 'From classic to cosmic — every bite is a groovy experience worth coming back for.',
      flavors_cta:      '🍩 Full Far Out Menu',
      tag_classic:      'Classic',
      tag_popular:      'Popular',
      tag_fan_fave:     'Fan Fave',
      tag_bold:         'Bold',
      tag_special:      'Special',

      /* Packs */
      packs_label:           'What We\'re Serving',
      packs_title:           'Our <span>Buckets</span>',
      packs_subtitle:        'Find us at an event, pick your pack, pick your flavors, and let the good times roll.',
      pack1_name:            'Peace Pack',
      pack1_count:           '6 Mini Donuts',
      pack1_desc:            'One flavor, six groovy bites of joy',
      pack1_feat1:           '1 Flavor of Choice',
      pack1_feat2:           'Made Fresh to Order',
      pack1_feat3:           'Perfect for One',
      pack2_name:            'Love Pack',
      pack2_count:           '12 Mini Donuts',
      pack2_desc:            'Two flavors, double the fun',
      pack2_feat1:           '2 Flavors of Choice',
      pack2_feat2:           'Made Fresh to Order',
      pack2_feat3:           'Great for Sharing',
      pack2_feat4:           'Best Value',
      pack3_name:            'The Whole Vibe',
      pack3_count:           '24 Mini Donuts',
      pack3_desc:            'Three flavors, one bucket to rule them all',
      pack3_feat1:           '3 Flavors of Choice',
      pack3_feat2:           'Made Fresh to Order',
      pack3_feat3:           'Perfect for Groups',
      pack_cta:              'Come Find Us →',
      pack_badge_popular:    'Most Popular',

      /* Events */
      events_label:    'Catch the Groove!',
      events_title:    'Find Us <span>Near You</span>',
      events_subtitle: 'Wanna know where the Glazed Over truck is rolling next? Check out upcoming events!',
      events_cta:      'See All Events →',

      /* Find Us */
      findus_label:  'Follow Along',
      findus_title:  'Stay in the <span>Loop</span>',
      findus_body:   'From festivals to neighborhood pop-ups, we\'re bringing buckets of joy all over the Valley. Follow us to get real-time updates on where the truck is rolling next, new flavor drops, and all the groovy happenings!',
      findus_cta:    'Get in Touch 👋',
      truck_sub:     'Mini Donuts Food Truck',
      findus_truck_location: 'Phoenix West Valley, AZ',

      /* About */
      about_label: 'Our Story',
      about_title: 'Meet <span>Ashley</span>, the Donut Dreamer',
      about_quote: '"I grew up watching my mom work her magic as a world dessert champion, TV food competition contestant, and award-winning baker. She taught me that great desserts start with great ingredients, a little creativity, and a whole lot of heart."',
      about_body1: 'Hi sweet friends — I\'m Ashley, the donut dreamer behind Glazed Over Mini Donuts. I\'ve been in love with the kitchen for as long as I can remember. As I got older and became a mom myself, that love only grew — right along with our family of seven kids.',
      about_body2: 'Then late last summer, one simple conversation about mini donuts turned into a big, bold dream. I took a leap of faith, quit my job, and Glazed Over Minis was born. No shortcuts. No funny business. Just hard work, honest ingredients, and donuts made with soul.',
      about_cta:   'Read the Full Story',
      about_snippet_bubble: '"I took a leap of faith and Glazed Over Minis was born." ✌️',
      about_page_title: 'The <span style="color:var(--clr-secondary);">Story</span> Behind the Donuts',
      about_photo_role: 'Founder & Donut Dreamer, Phoenix AZ',
      about_badge_heart: 'Heart',
      about_badge_quality: 'Quality',
      about_badge_peace: 'Peace',
      about_badge_donuts: 'Donuts',
      about_badge_family: 'Family',
      about_badge_hustle: 'Hustle',

      /* Footer */
      footer_tagline:     'Old-school feel-good mini donuts made with quality, real ingredients and flavor that\'ll make your eyes roll back. Serving the Phoenix West Valley. ✌️❤️🍩',
      footer_nav_title:   'Navigate',
      footer_menu_title:  'Menu',
      footer_findus_title:'Find Us',
      footer_home:        '→ Home',
      footer_menu_link:   '→ Far Out Menu',
      footer_about:       '→ About Ashley',
      footer_contact:     '→ Contact & Events',
      footer_packs:       '→ Packs & Pricing',
      footer_flavors:     '→ Far Out Flavors',
      footer_specials:    '→ Monthly Specials',
      footer_beverages:   '→ Beverages',
      footer_legal_title: 'Legal',
      footer_privacy:     '→ Privacy Policy',
      footer_terms:       '→ Terms of Service',
      footer_events:      '→ Upcoming Events',
      footer_events_contact: '→ April Events',
      footer_instagram:   '→ Instagram Updates',
      footer_facebook:    '→ Facebook Page',
      footer_tiktok:      '→ TikTok Videos',
      footer_copy:        '© 2026 Glazed Over Mini Donuts. All rights reserved. Made with ❤️ in Phoenix, AZ.',

      /* ---- Menu Page ------------------------------------------ */
      menu_hero_sub:     'Made to order. Made with soul. Pick your pack and pick your glaze — joy incoming.',
      menu_page_title:   'Far Out <span style="color:var(--clr-secondary);">Flavors</span>',
      menu_packs_label:  'Get Your Glaze On',
      menu_packs_title:  'Choose Your <span>Pack</span>',
      menu_flavors_label:'The Main Event',
      menu_flavors_title:'Far Out <span>Flavors</span>',
      menu_flavors_sub:  'Every flavor crafted with real ingredients and a whole lot of heart.',
      menu_monthly_label:'Limited Time Only',
      menu_monthly_title:'This Month\'s <span>Jam</span>',
      menu_monthly_sub:  'Special seasonal flavors — here today, gone tomorrow. Don\'t sleep on \'em!',
      menu_bev_label:    'Wash it Down',
      menu_bev_title:    'Radical <span>Beverages</span>',
      menu_bev_sub:      'Keep the groove going with a drink to match your vibe.',
      menu_cta_label:    'Ready to Order?',
      menu_cta_title:    'Find Our <span>Truck</span>',
      menu_cta_body:     'We\'re rolling through the Phoenix West Valley. Check our events page to find us near you!',
      menu_cta_btn:      '🚚 Come Find Us →',
      /* Flavor names */
      fl_glazed_name:    'Glazed & Confused',
      fl_glazed_desc:    'Classic glaze — simple, perfect, and timeless',
      fl_picture_name:   'Picture Perfect',
      fl_picture_desc:   'Strawberry glaze + rainbow sprinkles',
      fl_churro_name:    'Churro Groove',
      fl_churro_desc:    'Cinnamon sugar + dulce de leche',
      fl_bacon_name:     'Bringing Home the Bacon',
      fl_bacon_desc:     'Maple drizzle + bacon bits',
      fl_rasp_name:      'Raspberry Beret',
      fl_rasp_desc:      'Powdered sugar + raspberry drizzle',
      fl_cinnamon_name:  'Cinnamon Girl',
      fl_cinnamon_desc:  'Classic cinnamon sugar — warm and nostalgic',
      fl_eclipse_name:   'A Total Eclipse',
      fl_eclipse_desc:   'Chocolate drizzle + sprinkles',
      fl_sugar_name:     'Pour Some Sugar on Me',
      fl_sugar_desc:     'Powdered sugar — pure, sweet, simple',
      fl_straw_name:     'Strawberry Fields',
      fl_straw_desc:     'Chocolate drizzle + strawberry drizzle + strawberry bits',
      fl_rocket_name:    'Rocket Man',
      fl_rocket_desc:    'Vanilla glaze + Oreo crumble — out of this world',
      /* Beverages */
      bev1_name:   'Java Jive',
      bev1_desc:   'Build your own coffee (Hot or Iced)',
      bev1_price:  '$3.50 sm / $5 lg',
      bev2_name:   'Hot Cocoa Hippie',
      bev2_desc:   'Rich, classic hot chocolate',
      bev2_price:  '$3.50 / $5 – 16oz',
      bev3_name:   'Moo Juice',
      bev3_desc:   'Chocolate or Whole Plain milk',
      bev3_price:  '$3.50',
      bev4_name:   'H2O-So Groovy',
      bev4_desc:   'Ice cold water — stay hydrated, baby',
      bev4_price:  '$2.50',
      /* Monthly specials */
      spec1_name:  'Orange Creamsicle',
      spec1_desc:  'A dreamy retro flavor — fresh orange vibes meets classic creamy sweetness. Coming soon.',
      spec2_name:  'Key Lime Pie',
      spec2_desc:  'Tangy, sweet, refreshing — just like a slice of key lime pie in a tiny donut. Coming soon.',
      spec_coming: 'COMING SOON',

      /* ---- About Page ----------------------------------------- */
      about_hero_sub:    'A mom of 7, a leap of faith, and a whole lot of heart. Meet Ashley.',
      about_h2_1:        'Hi Sweet Friends — I\'m Ashley',
      about_p1:          'I\'m the donut dreamer behind Glazed Over Mini Donuts, and I\'ve been in love with the kitchen for as long as I can remember.',
      about_quote_pull:  '"I grew up watching my mom work her magic as a world dessert champion, TV food competition contestant, and award-winning baker."',
      about_p2:          'She taught me that great desserts start with great ingredients, a little creativity, and a whole lot of heart. That lesson never left me.',
      about_h2_2:        'A Kitchen Full of Laughter',
      about_p3:          'As I got older and became a mom myself, that love only grew — right along with our family of seven kids. Our kitchen has always been full of laughter, messes, memories, and something sweet in the oven. Food has always been how we show love.',
      about_h2_3:        'The Leap of Faith',
      about_p4:          'Then late last summer, one simple conversation about mini donuts turned into a big, bold dream. I took a leap of faith, quit my job, and Glazed Over Minis was born.',
      about_p5:          'It wasn\'t easy — it never is when you\'re building something from scratch. But I knew exactly what I wanted to create: donuts made the old-school way, with real ingredients and genuine care.',
      about_h2_4:        'Made With Soul',
      about_p6:          'Today, we serve up old-school, feel-good mini donuts made with quality real ingredients and flavor that\'ll make your eyes roll back and have you coming back for more. No shortcuts. No funny business. Just hard work, honest ingredients, and donuts made with soul.',
      about_p7:          'Because I believe in hustle, heart, and a product that speaks for itself.',
      about_btn_menu:    '🍩 See the Menu',
      about_btn_findus:  'Come Find Us →',
      /* Values strip */
      val1_title: 'BEEF TALLOW',
      val1_desc:  'Fried in real, classic beef tallow',
      val3_title: 'REAL COLORS',
      val3_desc:  'No artificial food coloring — just natural beauty',
      val4_title: 'MADE TO ORDER',
      val4_desc:  'Every batch made fresh when you order it',
      val5_title: 'MADE WITH SOUL',
      val5_desc:  'Every donut made with genuine care and heart',
      /* About CTA section */
      about_cta_title: 'Come Find <span>the Truck</span>',
      about_cta_body:  'Life\'s a little sweeter with peace, love, and donuts. We\'d love to see you out there!',
      about_cta_btn1:  '🚚 Come Find Us →',
      about_cta_btn2:  'View the Menu',

      /* ---- Contact Page --------------------------------------- */
      contact_page_title:   'Say <span style="color:var(--clr-secondary);">Hello!</span>',
      contact_hero_sub:    'Find our truck, check upcoming events, or drop us a message. We love hearing from you.',
      contact_info_logo:   'Glazed Over',
      contact_info_sub:    'Mini Donuts Food Truck — Phoenix West Valley',
      contact_loc_label:   'Location',
      contact_loc_val:     'Phoenix West Valley, Arizona<br>We travel — follow us for exact locations!',
      contact_reach_label: 'Best Way to Reach Us',
      contact_reach_val:   'Follow us on Instagram, Facebook, or TikTok for real-time updates on where we are!',
      contact_hrs_label:   'Hours',
      contact_hrs_val:     'Varies by event<br>Check our social media for current schedule',
      contact_follow:      'Follow & Connect',
      contact_form_label:  'Drop Us a Line',
      contact_form_title:  'Send a <span>Message</span>',
      contact_form_intro:  'Have a question, want to book us for your event, or just want to say hi? We\'d love to hear from you!',
      contact_fn:          'First Name',
      contact_ln:          'Last Name',
      contact_email:       'Email Address',
      contact_phone:       'Phone Number',
      contact_ph_fn:       'Peace',
      contact_ph_ln:       'Love',
      contact_ph_email:    'you@groovy.com',
      contact_ph_phone:    '(623) 555-0123',
      contact_subject:     'What\'s on your mind?',
      contact_subj_ph:     'Choose a topic…',
      contact_subj_gen:    'General Question',
      contact_subj_event:  'Event / Catering Inquiry',
      contact_subj_loc:    'Where Are You This Week?',
      contact_subj_menu:   'Menu Question',
      contact_subj_fb:     'Feedback & Love',
      contact_subj_other:  'Something Else',
      contact_event_intro: 'Planning an event or catering order? Share as many details as you can below.',
      contact_event_name:  'Event Name',
      contact_ph_event_name: 'Spring Festival',
      contact_event_date:  'Event Date',
      contact_event_time:  'Event Time',
      contact_guest_count: 'Estimated Guest Count',
      contact_ph_guest_count: '75',
      contact_event_location: 'Event Location',
      contact_ph_event_location: 'Goodyear, AZ',
      contact_catering_amount: 'Catering Amount / Order Size',
      contact_ph_catering_amount: '120 mini donuts / 10 dozen',
      contact_msg:         'Your Message',
      contact_ph_message:  'Tell us all about it! ✌️',
      contact_send:        '🍩 Send It!',
      contact_sending:     'Sending...',
      contact_success_h:   'Groovy! Message Sent!',
      contact_success_p:   'Thanks for reaching out! We\'ll get back to you real soon. In the meantime, follow us on social media to stay in the loop! ✌️❤️🍩',
      contact_success_menu:'See the Menu',
      contact_success_home:'Go Home',
      contact_ev_label:    'Catch the Groove!',
      contact_ev_title:    'Upcoming <span>Events</span>',
      contact_ev_sub:      'Find us rolling through the Valley near you. Come get your glaze on!',
      month_apr:           'Apr',
      contact_more_month:  'More',
      contact_more_events: 'More Events Coming!',
      contact_follow_latest: 'Follow us for the latest',
      contact_map_title:   'Serving the Phoenix <span>West Valley</span>',
      contact_map_body:    'From Surprise to Goodyear, Glendale to Litchfield Park — we\'re rolling through your neighborhood. Follow us on social media for real-time location updates!',
      contact_follow_instagram: 'Follow on Instagram',
      contact_follow_facebook: 'Follow on Facebook',
        notfound_hero_title: '404 <span style="color:var(--clr-secondary);">Page Not Found</span>',
        notfound_hero_sub: 'Looks like this batch got lost on the way. Let\'s get you back to the good stuff.',
        notfound_label: 'Wrong Turn, Baby',
        notfound_title: 'This page is <span>off the map</span>',
        notfound_body: 'The page you requested is not here, but the donuts definitely still are. Head back home, check the menu, or find the truck.',
        notfound_home: 'Take Me Home',
        notfound_menu: 'See the Menu',
        notfound_contact: 'Find the Truck',
        notfound_tip1: 'Double-check the web address for typos.',
        notfound_tip2: 'If you used a shortcut like /contact, the fallback may redirect you automatically.',
        notfound_tip3: 'Still stuck? Use the links below to jump back into the site.',
        notfound_status_label: 'Requested route',
        notfound_requested_label: 'You asked for',
        notfound_side_badge: 'Route helper',
        notfound_side_title: 'Let\'s get you back on the trail',
        notfound_side_copy: 'Here\'s the path that was requested and the quickest way back into the site.',
        notfound_status_default: 'We could not match that address to one of the current pages, but the shortcuts below will get you back on track.',
        notfound_redirecting: 'That looks like a shortcut to one of our pages. Redirecting you now…',
        notfound_redirect_cta: 'Go there now',
        notfound_shortcuts_label: 'Popular Stops',
        notfound_shortcut_home_title: 'Home Base',
        notfound_shortcut_home_body: 'Jump back to the homepage and start fresh.',
        notfound_shortcut_menu_title: 'Far Out Menu',
        notfound_shortcut_menu_body: 'Browse flavors, packs, and monthly specials.',
        notfound_shortcut_contact_title: 'Find the Truck',
        notfound_shortcut_contact_body: 'See events, locations, and ways to get in touch.',
      copy_success:        '✔ Copied!',
    },

    es: {
      /* Accessibility */
      skip_link: 'Saltar al contenido principal',
      meta_title_home: 'Glazed Over Mini Donuts | Donas Groovy, Valle Oeste de Phoenix',
      meta_title_about: 'Sobre Ashley | Glazed Over Mini Donuts',
      meta_title_menu: 'Menú Completo | Glazed Over Mini Donuts',
      meta_title_contact: 'Contacto y Eventos | Glazed Over Mini Donuts',
        meta_title_404: '404 | Glazed Over Mini Donuts',
      nav_logo_home_aria: 'Glazed Over Mini Donuts — Inicio',
      nav_toggle_label: 'Abrir o cerrar menú',
      back_to_top: 'Volver arriba',
      scroll_down: 'Desplazarse hacia abajo',
      leave_site_confirm: '¿Seguro que quieres ir a {link}? Saldrás de este sitio.',
      leave_site_eyebrow: 'Enlace externo',
      leave_site_title: 'Vas a salir de Glazed Over Mini Donuts',
      leave_site_body: '¿Seguro que quieres ir a {link}?',
      leave_site_notice: 'Saldrás de este sitio.',
      leave_site_destination: 'Destino',
      leave_site_stay: 'Quedarme aquí',
      leave_site_leave: 'Salir del sitio',

      /* Nav */
      nav_home:    'Inicio',
      nav_menu:    'Menú',
      nav_about:   'Nosotros',
      nav_contact: 'Contacto',
      nav_legal:   'Legal',

      /* Hero */
      loading_home:          '¡Glaseando todo…!',
      loading_about:         'Un segundito…',
      loading_menu:          'Cargando el menú…',
      loading_contact:       '¡Ya vamos…!',
        loading_404:          'Buscando la tanda correcta…',
      hero_badge:            '¡Ahora en el Valle Oeste de Phoenix!',
      hero_heading:          '<span class="word-groovy">Donas</span><br>Artesanales Hechas<br><span class="line-highlight">con Amor</span>',
      hero_desc:             'Donas mini frescas hechas al momento, fritas en sebo de res — sin colorantes artificiales. Pura paz, amor y cubetas llenas de alegría. ✌️❤️🍩',
      hero_cta_menu:         '🍩 Ver Nuestros Sabores',
      hero_cta_truck:        'Encuéntranos',
      hero_badge_oils:       'Sin Colorantes Artificiales',
      hero_badge_ingredients:'Ingredientes Reales',
      hero_badge_mto:        'Hecho al Momento',
      marquee_item1:         'Fritas en Sebo de Res',
      marquee_item2:         'Sin Colorantes Artificiales',
      marquee_item3:         'Hechas al Momento',
      marquee_item4:         'Ingredientes Reales',
      marquee_item5:         'Sin Colorantes Artificiales',
      marquee_item6:         'Valle Oeste de Phoenix',
      marquee_item7:         '✌️ Paz Amor Donas 🍩',
      marquee_item8:         'Glaseados Groovy',
      marquee_item9:         'Cubetas de Alegría',

      /* Ingredients */
      ingredients_label:    'Auténticos Desde el Primer Día',
      ingredients_title:    'Calidad <span>Artesanal</span>,<br>Sin Atajos',
      ingredients_body:     'Estamos devolviendo las donas a los buenos tiempos, cuando la calidad era lo primero y el sabor era el rey. Nuestras donas se fríen en sebo de res para ese sabor dorado e irresistible. Sin colorantes artificiales — solo ingredientes reales.',
      ingredients_cta:      'Nuestra Historia',
      chip_tallow:          'Fritas en Sebo de Res',
      chip_oils:            'Sabor Groovy',
      chip_colors:          'Sin Colorantes Artificiales',
      chip_real:            'Solo Ingredientes Reales',
      chip_mto:             'Hecho al Momento',
      chip_soul:            'Hecho con Amor',
      card_back_eyebrow:    'Por Qué Saben Mejor',
      card_back_text:       '<span class="card-back-line"><span class="card-back-main">Fritura a la antigua</span><span class="card-back-sub">Hechas con sebo de res</span></span><span class="card-back-line"><span class="card-back-main">Ingredientes reales</span><span class="card-back-sub">Hechas frescas al momento</span></span><span class="card-back-line"><span class="card-back-main">Hechas al momento</span><span class="card-back-sub">Frescas como nuestras vibras groovy</span></span>',
      card_back_pill1:      '100% Sebo de Res',
      card_back_pill2:      'Sin Colorantes Artificiales',
      card_back_pill3:      'Hechas al Momento',
      card_fried_in:        'Fritas en',
      card_tallow:          'Sebo de Res',
      card_oils_label:      'Aceites de Semillas',
      card_oils_val:        'Algunos sabores pueden incluirlos.',
      card_promise_label:   'Nuestra Promesa',
      card_promise_val:     'Sabor de Antaño',
      card_quote:           '"Donas artesanales hechas como siempre se hicieron." ✌️',

      /* Flavors */
      flavors_label:    'Sabores de Otro Mundo',
      flavors_title:    'Elige Tu <span>Glaseado</span>',
      flavors_subtitle: 'Del clásico al cósmico — cada mordida es una experiencia única.',
      flavors_cta:      '🍩 Ver Menú Completo',
      tag_classic:      'Clásico',
      tag_popular:      'Popular',
      tag_fan_fave:     'Favorito',
      tag_bold:         'Atrevido',
      tag_special:      'Especial',

      /* Packs */
      packs_label:           'Lo Que Ofrecemos',
      packs_title:           'Nuestras <span>Cubetas</span>',
      packs_subtitle:        'Encuéntranos en un evento, elige tu paquete y tus sabores, ¡y que empiece la fiesta!',
      pack1_name:            'Paquete Paz',
      pack1_count:           '6 Donas Mini',
      pack1_desc:            'Un sabor, seis mordidas de alegría',
      pack1_feat1:           '1 Sabor a Elegir',
      pack1_feat2:           'Hecho Fresco al Momento',
      pack1_feat3:           'Perfecto para Uno',
      pack2_name:            'Paquete Amor',
      pack2_count:           '12 Donas Mini',
      pack2_desc:            'Dos sabores, el doble de diversión',
      pack2_feat1:           '2 Sabores a Elegir',
      pack2_feat2:           'Hecho Fresco al Momento',
      pack2_feat3:           'Ideal para Compartir',
      pack2_feat4:           'Mejor Precio',
      pack3_name:            'El Viaje Completo',
      pack3_count:           '24 Donas Mini',
      pack3_desc:            'Tres sabores, una cubeta para dominarlos a todos',
      pack3_feat1:           '3 Sabores a Elegir',
      pack3_feat2:           'Hecho Fresco al Momento',
      pack3_feat3:           'Ideal para Grupos',
      pack_cta:              'Encuéntranos →',
      pack_badge_popular:    'Más Popular',

      /* Events */
      events_label:    '¡Al Ritmo del Groove!',
      events_title:    'Encuéntranos <span>Cerca</span>',
      events_subtitle: '¿Quieres saber dónde está el camión de Glazed Over? ¡Mira los próximos eventos!',
      events_cta:      'Ver Todos los Eventos →',

      /* Find Us */
      findus_label:  'Síguenos',
      findus_title:  'Mantente en el <span>Rollo</span>',
      findus_body:   'Desde festivales hasta pop-ups del vecindario, llevamos cubetas de alegría por todo el Valle. Síguenos para recibir actualizaciones en tiempo real de dónde estará el camión, nuevos sabores y todas las novedades groovy.',
      findus_cta:    'Ponte en Contacto 👋',
      truck_sub:     'Camión de Donas Mini',
      findus_truck_location: 'Valle Oeste de Phoenix, Arizona',

      /* About */
      about_label: 'Nuestra Historia',
      about_title: 'Conoce a <span>Ashley</span>, la Soñadora de Donas',
      about_quote: '"Crecí viendo a mi mamá trabajar su magia como campeona mundial de postres, concursante de TV y pastelera premiada. Ella me enseñó que los grandes postres empiezan con grandes ingredientes, un poco de creatividad y mucho corazón."',
      about_body1: 'Hola, amigos dulces — Soy Ashley, la soñadora de donas detrás de Glazed Over Mini Donuts. He estado enamorada de la cocina desde que tengo memoria. A medida que crecí y me convertí en mamá, ese amor solo creció — ¡junto a nuestra familia de siete hijos!',
      about_body2: 'A finales del verano pasado, una simple conversación sobre donas mini se convirtió en un gran sueño. Di el salto de fe, dejé mi trabajo y nació Glazed Over Minis. Sin atajos. Sin trucos. Solo trabajo duro, ingredientes honestos y donas hechas con alma.',
      about_cta:   'Leer la Historia Completa',
      about_snippet_bubble: '"Di un salto de fe y nacieron las Glazed Over Minis." ✌️',
      about_page_title: 'La <span style="color:var(--clr-secondary);">Historia</span> Detrás de las Donas',
      about_photo_role: 'Fundadora y Soñadora de Donas, Phoenix AZ',
      about_badge_heart: 'Corazón',
      about_badge_quality: 'Calidad',
      about_badge_peace: 'Paz',
      about_badge_donuts: 'Donas',
      about_badge_family: 'Familia',
      about_badge_hustle: 'Esfuerzo',

      /* Footer */
      footer_tagline:     'Donas mini artesanales, hechas con ingredientes reales y un sabor que te hará los ojos en blanco. Sirviendo el Valle Oeste de Phoenix. ✌️❤️🍩',
      footer_nav_title:   'Navegar',
      footer_menu_title:  'Menú',
      footer_findus_title:'Encuéntranos',
      footer_home:        '→ Inicio',
      footer_menu_link:   '→ Menú Completo',
      footer_about:       '→ Sobre Ashley',
      footer_contact:     '→ Contacto y Eventos',
      footer_packs:       '→ Paquetes y Precios',
      footer_flavors:     '→ Sabores',
      footer_specials:    '→ Especiales del Mes',
      footer_beverages:   '→ Bebidas',
      footer_legal_title: 'Legal',
      footer_privacy:     '→ Política de Privacidad',
      footer_terms:       '→ Términos del Servicio',
      footer_events:      '→ Próximos Eventos',
      footer_events_contact: '→ Eventos de Abril',
      footer_instagram:   '→ Instagram',
      footer_facebook:    '→ Facebook',
      footer_tiktok:      '→ TikTok',
      footer_copy:        '© 2026 Glazed Over Mini Donuts. Todos los derechos reservados. Hecho con ❤️ en Phoenix, AZ.',

      /* ---- Menu Page ------------------------------------------ */
      menu_hero_sub:     'Hecho al momento. Hecho con alma. Elige tu paquete y tu glaseado — ¡la alegría está en camino!',
      menu_page_title:   'Sabores <span style="color:var(--clr-secondary);">de Otro Mundo</span>',
      menu_packs_label:  '¡Consigue Tu Glaseado!',
      menu_packs_title:  'Elige Tu <span>Paquete</span>',
      menu_flavors_label:'El Evento Principal',
      menu_flavors_title:'Sabores de Otro <span>Mundo</span>',
      menu_flavors_sub:  'Cada sabor elaborado con ingredientes reales y mucho corazón.',
      menu_monthly_label:'Solo por Tiempo Limitado',
      menu_monthly_title:'Lo Mejor del <span>Mes</span>',
      menu_monthly_sub:  '¡Sabores especiales de temporada — hoy están, mañana no! ¡No te los pierdas!',
      menu_bev_label:    'Para Bajar',
      menu_bev_title:    '<span>Bebidas</span> Radicales',
      menu_bev_sub:      'Sigue con el ritmo con una bebida que combine con tu energía.',
      menu_cta_label:    '¿Listo para Ordenar?',
      menu_cta_title:    'Encuentra Nuestro <span>Camión</span>',
      menu_cta_body:     '¡Estamos rodando por el Valle Oeste de Phoenix! Consulta nuestra página de eventos para encontrarnos cerca de ti.',
      menu_cta_btn:      '🚚 Encuéntranos →',
      /* Flavor names */
      fl_glazed_name:    'Glazed & Confused',
      fl_glazed_desc:    'Glaseado clásico — simple, perfecto e inmortal',
      fl_picture_name:   'Picture Perfect',
      fl_picture_desc:   'Glaseado de fresa + chispas de colores',
      fl_churro_name:    'Churro Groove',
      fl_churro_desc:    'Azúcar con canela + dulce de leche',
      fl_bacon_name:     'Trayendo el Tocino a Casa',
      fl_bacon_desc:     'Jarabe de maple + trocitos de tocino',
      fl_rasp_name:      'Boina Frambuesa',
      fl_rasp_desc:      'Azúcar glass + frambuesa',
      fl_cinnamon_name:  'Chica Canela',
      fl_cinnamon_desc:  'Canela con azúcar clásica — cálida y nostálgica',
      fl_eclipse_name:   'Un Eclipse Total',
      fl_eclipse_desc:   'Chocolate + chispas de colores',
      fl_sugar_name:     'Échame Más Azúcar',
      fl_sugar_desc:     'Azúcar glass — puro, dulce y simple',
      fl_straw_name:     'Campos de Fresa',
      fl_straw_desc:     'Chocolate + fresa + trozos de fresa',
      fl_rocket_name:    'Hombre Cohete',
      fl_rocket_desc:    'Glaseado de vainilla + Oreo — fuera de este mundo',
      /* Beverages */
      bev1_name:   'Java Jive',
      bev1_desc:   'Crea tu propio café (Caliente o Frío)',
      bev1_price:  '$3.50 chico / $5 grande',
      bev2_name:   'Hippie de Cacao Caliente',
      bev2_desc:   'Rico chocolate caliente clásico',
      bev2_price:  '$3.50 / $5 – 16oz',
      bev3_name:   'Jugo de Vaca',
      bev3_desc:   'Leche de chocolate o leche entera',
      bev3_price:  '$3.50',
      bev4_name:   'Agua Súper Groovy',
      bev4_desc:   'Agua helada — hidratémonos, cariño',
      bev4_price:  '$2.50',
      /* Monthly specials */
      spec1_name:  'Naranja Cremosa',
      spec1_desc:  'Un sabor retro de ensueño — vibras de naranja fresca con cremosa dulzura clásica. Próximamente.',
      spec2_name:  'Pie de Lima',
      spec2_desc:  'Ácido, dulce, refrescante — como un trozo de pie de lima en una dona mini. Próximamente.',
      spec_coming: 'MUY PRONTO',

      /* ---- About Page ----------------------------------------- */
      about_hero_sub:    'Una mamá de 7, un salto de fe y mucho corazón. Conoce a Ashley.',
      about_h2_1:        'Hola Amigos Dulces — Soy Ashley',
      about_p1:          'Soy la soñadora de donas detrás de Glazed Over Mini Donuts, y he estado enamorada de la cocina desde que tengo memoria.',
      about_quote_pull:  '"Crecí viendo a mi mamá trabajar su magia como campeona mundial de postres, concursante de TV y pastelera premiada."',
      about_p2:          'Ella me enseñó que los grandes postres empiezan con grandes ingredientes, un poco de creatividad y mucho corazón. Esa lección nunca me abandonó.',
      about_h2_2:        'Una Cocina Llena de Risas',
      about_p3:          'A medida que crecí y me convertí en mamá, ese amor solo creció — ¡junto a nuestra familia de siete hijos! Nuestra cocina siempre ha estado llena de risas, desorden, recuerdos y algo dulce en el horno. La comida siempre ha sido nuestra forma de mostrar amor.',
      about_h2_3:        'El Salto de Fe',
      about_p4:          'A finales del verano pasado, una simple conversación sobre donas mini se convirtió en un gran sueño. Di el salto de fe, dejé mi trabajo y nació Glazed Over Minis.',
      about_p5:          'No fue fácil — nunca lo es cuando construyes algo desde cero. Pero sabía exactamente lo que quería crear: donas hechas a la antigua usanza, con ingredientes reales y cuidado genuino.',
      about_h2_4:        'Hechas con Alma',
      about_p6:          'Hoy servimos donas mini de la vieja escuela, hechas con ingredientes reales de calidad y un sabor que te hará los ojos en blanco y te hará volver por más. Sin atajos. Sin trucos. Solo trabajo duro, ingredientes honestos y donas hechas con alma.',
      about_p7:          'Porque creo en el esfuerzo, el corazón y un producto que habla por sí solo.',
      about_btn_menu:    '🍩 Ver el Menú',
      about_btn_findus:  'Encuéntranos →',
      /* Values strip */
      val1_title: 'SEBO DE RES',
      val1_desc:  'Fritas en sebo de res natural',
      val2_title: 'SABOR GROOVY',
      val2_desc:  'Mucho sabor en cada bocado',
      val3_title: 'COLORES REALES',
      val3_desc:  'Sin colorantes artificiales — solo belleza natural',
      val4_title: 'AL MOMENTO',
      val4_desc:  'Cada lote hecho fresco cuando ordenas',
      val5_title: 'CON ALMA',
      val5_desc:  'Cada dona hecha con cuidado genuino y corazón',
      /* About CTA section */
      about_cta_title: 'Ven a <span>Encontrarnos</span>',
      about_cta_body:  '¡La vida es un poco más dulce con paz, amor y donas. ¡Nos encantaría verte por aquí!',
      about_cta_btn1:  '🚚 Encuéntranos →',
      about_cta_btn2:  'Ver el Menú',

      /* ---- Contact Page --------------------------------------- */
      contact_page_title:   'Di <span style="color:var(--clr-secondary);">¡Hola!</span>',
      contact_hero_sub:    'Encuéntranos, consulta próximos eventos o envíanos un mensaje. ¡Nos encanta saber de ti!',
      contact_info_logo:   'Glazed Over',
      contact_info_sub:    'Camión de Donas Mini — Valle Oeste de Phoenix',
      contact_loc_label:   'Ubicación',
      contact_loc_val:     'Valle Oeste de Phoenix, Arizona<br>¡Viajamos, síguenos para ubicaciones exactas!',
      contact_reach_label: 'La Mejor Manera de Contactarnos',
      contact_reach_val:   '¡Síguenos en Instagram, Facebook o TikTok para actualizaciones en tiempo real sobre dónde estamos!',
      contact_hrs_label:   'Horarios',
      contact_hrs_val:     'Varía según el evento<br>Consulta nuestras redes sociales para el horario actual',
      contact_follow:      'Síguenos y Conecta',
      contact_form_label:  'Escríbenos',
      contact_form_title:  'Envía un <span>Mensaje</span>',
      contact_form_intro:  '¿Tienes una pregunta, quieres contratarnos para tu evento o simplemente quieres saludar? ¡Nos encantaría saber de ti!',
      contact_fn:          'Nombre',
      contact_ln:          'Apellido',
      contact_email:       'Correo Electrónico',
      contact_phone:       'Número de Teléfono',
      contact_ph_fn:       'Paz',
      contact_ph_ln:       'Amor',
      contact_ph_email:    'tu@correo.com',
      contact_ph_phone:    '(623) 555-0123',
      contact_subject:     '¿Qué tienes en mente?',
      contact_subj_ph:     'Elige un tema…',
      contact_subj_gen:    'Pregunta General',
      contact_subj_event:  'Consulta de Evento / Catering',
      contact_subj_loc:    '¿Dónde Están Esta Semana?',
      contact_subj_menu:   'Pregunta sobre el Menú',
      contact_subj_fb:     'Comentarios y Amor',
      contact_subj_other:  'Algo más',
      contact_event_intro: '¿Estás planeando un evento o pedido de catering? Comparte todos los detalles que tengas abajo.',
      contact_event_name:  'Nombre del Evento',
      contact_ph_event_name: 'Festival de Primavera',
      contact_event_date:  'Fecha del Evento',
      contact_event_time:  'Hora del Evento',
      contact_guest_count: 'Cantidad Estimada de Invitados',
      contact_ph_guest_count: '75',
      contact_event_location: 'Ubicación del Evento',
      contact_ph_event_location: 'Goodyear, AZ',
      contact_catering_amount: 'Cantidad de Catering / Tamaño del Pedido',
      contact_ph_catering_amount: '120 mini donas / 10 docenas',
      contact_msg:         'Tu Mensaje',
      contact_ph_message:  '¡Cuéntanos todo! ✌️',
      contact_send:        '🍩 ¡Enviar!',
      contact_sending:     'Enviando...',
      contact_success_h:   '¡Genial! ¡Mensaje Enviado!',
      contact_success_p:   '¡Gracias por contactarnos! Te responderemos pronto. ¡Mientras tanto, síguenos en redes para estar al tanto! ✌️❤️🍩',
      contact_success_menu:'Ver el Menú',
      contact_success_home:'Ir a Inicio',
      contact_ev_label:    '¡Al Ritmo del Groove!',
      contact_ev_title:    'Próximos <span>Eventos</span>',
      contact_ev_sub:      'Encuéntranos rodando por el Valle cerca de ti. ¡Ven a buscar tu glaseado!',
      month_apr:           'Abr',
      contact_more_month:  'Más',
      contact_more_events: '¡Más eventos próximamente!',
      contact_follow_latest: 'Síguenos para lo último',
      contact_map_title:   'Sirviendo el <span>Valle Oeste de Phoenix</span>',
      contact_map_body:    'De Surprise a Goodyear, de Glendale a Litchfield Park — pasamos por tu vecindario. ¡Síguenos en redes sociales para actualizaciones de ubicación en tiempo real!',
      contact_follow_instagram: 'Seguir en Instagram',
      contact_follow_facebook: 'Seguir en Facebook',
        notfound_hero_title: '404 <span style="color:var(--clr-secondary);">Página no encontrada</span>',
        notfound_hero_sub: 'Parece que esta tanda se perdió en el camino. Vamos a llevarte de vuelta a lo bueno.',
        notfound_label: 'Te desviaste un poco',
        notfound_title: 'Esta página está <span>fuera del mapa</span>',
        notfound_body: 'La página que pediste no está aquí, pero las mini donas sí. Vuelve al inicio, revisa el menú o busca el camión.',
        notfound_home: 'Llévame al inicio',
        notfound_menu: 'Ver el menú',
        notfound_contact: 'Encontrar el camión',
        notfound_tip1: 'Revisa si la dirección web tiene algún error.',
        notfound_tip2: 'Si usaste un atajo como /contact, el fallback puede redirigirte automáticamente.',
        notfound_tip3: '¿Aún atorado? Usa los enlaces de abajo para volver al sitio.',
        notfound_status_label: 'Ruta solicitada',
        notfound_requested_label: 'Pediste',
        notfound_side_badge: 'Ayuda de ruta',
        notfound_side_title: 'Vamos a ponerte otra vez en camino',
        notfound_side_copy: 'Aquí está la ruta solicitada y la forma más rápida de volver al sitio.',
        notfound_status_default: 'No pudimos relacionar esa dirección con una de las páginas actuales, pero los accesos rápidos de abajo te pondrán otra vez en camino.',
        notfound_redirecting: 'Parece un atajo a una de nuestras páginas. Redirigiéndote ahora…',
        notfound_redirect_cta: 'Ir ahora',
        notfound_shortcuts_label: 'Paradas populares',
        notfound_shortcut_home_title: 'Base principal',
        notfound_shortcut_home_body: 'Vuelve al inicio y empieza de nuevo.',
        notfound_shortcut_menu_title: 'Menú completo',
        notfound_shortcut_menu_body: 'Explora sabores, paquetes y especiales del mes.',
        notfound_shortcut_contact_title: 'Encuentra el camión',
        notfound_shortcut_contact_body: 'Mira eventos, ubicaciones y formas de contactarnos.',
      copy_success:        '✔ ¡Copiado!',
    },

  };

  /* ---- Apply a language to the page --------------------------- */
  function applyLang(lang) {
    var strings = TRANSLATIONS[lang];
    if (!strings) return;

    /* Update html lang attribute */
    document.documentElement.setAttribute('lang', lang);

    if (window.GOMConsent && window.GOMConsent.canUse('preferences')) {
      saveLang(lang);
    }

    /* Replace text content */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (strings[key] !== undefined) {
        el.textContent = strings[key];
      }
    });

    /* Replace HTML content (for elements with spans / markup) */
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (strings[key] !== undefined) {
        el.innerHTML = strings[key];
      }
    });

    /* Replace attribute values */
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (strings[key] !== undefined) {
        el.setAttribute('placeholder', strings[key]);
      }
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria-label');
      if (strings[key] !== undefined) {
        el.setAttribute('aria-label', strings[key]);
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      if (strings[key] !== undefined) {
        el.setAttribute('title', strings[key]);
      }
    });

    /* Update lang toggle button label */
    var btn = document.getElementById('lang-toggle');
    if (btn) {
      var next = lang === 'en' ? 'ES' : 'EN';
      btn.querySelector('.lang-label').textContent = next;
      btn.setAttribute('aria-label', lang === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés');
      btn.setAttribute('data-lang', lang);
    }

    if (window.GOMRefreshThemeToggle) window.GOMRefreshThemeToggle();

    /* Announce to screen readers */
    var live = document.getElementById('lang-live');
    if (live) live.textContent = lang === 'en' ? 'Language changed to English' : 'Idioma cambiado a Español';

    document.dispatchEvent(new CustomEvent('gom:langchange', { detail: { lang: lang } }));
  }

  window.GOMI18N = {
    t: function (key) {
      var lang = document.documentElement.getAttribute('lang') || getStoredLang() || 'en';
      if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key] !== undefined) return TRANSLATIONS[lang][key];
      if (TRANSLATIONS.en && TRANSLATIONS.en[key] !== undefined) return TRANSLATIONS.en[key];
      return '';
    },
    applyLang: applyLang,
  };

  /* ---- Toggle language ---------------------------------------- */
  function toggleLang() {
    var current = document.documentElement.getAttribute('lang') || 'en';
    var next = current === 'en' ? 'es' : 'en';
    saveLang(next);
    applyLang(next);
  }

  /* ---- Init --------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    /* Read saved preference, fall back to site config or 'en' */
    var saved = getStoredLang();
    if (!saved) {
      saved = (window.SiteConfig && window.SiteConfig.defaultLang) || 'en';
    }
    applyLang(saved);

    /* Wire toggle button */
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.addEventListener('click', toggleLang);
  });

  document.addEventListener('gom:consentchange', function (event) {
    var consent = event && event.detail ? event.detail : null;
    var saved = getCurrentLangPref();
    if (consent && consent.preferences) saveLang(saved);
    applyLang(saved);
  });

})();
