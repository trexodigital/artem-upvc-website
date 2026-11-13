/* ==========================================================================
   ARTEM uPVC — SITE CONTENT
   --------------------------------------------------------------------------
   Everything a non-developer may need to edit lives in this one file:
   contact details, product list, photos, FAQ.

   SOURCE KEY used in comments below:
     [FB]      = confirmed from ARTEM's public Facebook page (Nov 2026)
     [CONFIRM] = needs owner confirmation before going live
     [STOCK]   = illustrative stock image (Unsplash / Pexels free licenses),
                 self-hosted in /assets/img/. NOT an ARTEM project.
                 Images are referenced WITHOUT the size suffix: the site
                 loads "<name>-800.jpg" / "<name>-1600.jpg" automatically.
                 To use ARTEM's own photo, save it as e.g.
                 assets/img/my-photo-800.jpg + my-photo-1600.jpg and set
                 img: "assets/img/my-photo"
   ========================================================================== */

window.ARTEM = {
  /* ------------------------------------------------------------------ */
  contact: {
    businessName: "ARTEM uPVC Windows and Doors",          // [FB] page name is "ARTEM", not "Artemu"
    address: "Purok 1 Tokyo, Sto. Niño, Lubao, Pampanga", // [FB] cover photo
    mapsLink: "https://maps.app.goo.gl/hBPwUP4pKNqCDmE87", // [FB] page details
    hours: "Open daily — message anytime",                  // [FB] page says "Always open" [CONFIRM real hours]
    email: "artemupvc.alumworks@gmail.com",                 // [FB] cover photo
    facebook: "https://www.facebook.com/artemupvcwindowsanddoors",
    messenger: "https://m.me/artemupvcwindowsanddoors",
    // [FB] numbers published on posts / cover. [CONFIRM] which ones are still active.
    phones: [
      { name: "Novie", display: "0961 286 7889", tel: "+639612867889", viber: true },
      { name: "Abby", display: "0915 799 1159", tel: "+639157991159" },
      { name: "Christian", display: "0961 429 5035", tel: "+639614295035" },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Products. Product list is [FB] (cover photo "We offer" list).
     Descriptions explain what each configuration IS — they are not
     ARTEM-specific technical specs. Do not add specs (sizes, U-values,
     glass thickness) until the owner provides them.                    */
  categories: [
    { id: "windows", label: "Windows" },
    { id: "doors", label: "Doors" },
    { id: "glass", label: "Glass & More" },
  ],

  products: [
    {
      id: "sliding-window",
      cat: "windows",
      name: "Sliding Windows",
      tagline: "Space-saving panels that glide side to side.",
      img: "assets/img/sliding-window", // [STOCK] illustrative
      op: "slide",
      body:
        "Sashes run horizontally on a track, so nothing swings into the room or out over a walkway. A practical, popular choice for bedrooms, living areas and wide openings.",
      bestFor: ["Bedrooms & living rooms", "Wide openings", "Rooms facing walkways or narrow side yards"],
    },
    {
      id: "casement-window",
      cat: "windows",
      name: "Casement Windows",
      tagline: "Side-hinged sashes that open fully for airflow.",
      img: "assets/img/casement-window", // [STOCK] illustrative
      op: "casement",
      body:
        "Hinged on one side and opened outward like a door, so the whole sash clears the opening. Good where you want maximum ventilation and an easy-to-reach handle.",
      bestFor: ["Maximum ventilation", "Kitchens & bedrooms", "Openings above counters"],
    },
    {
      id: "awning-window",
      cat: "windows",
      name: "Awning Windows",
      tagline: "Top-hinged — opens outward, lets air in during light rain.",
      img: "assets/img/awning-window", // [STOCK] illustrative
      op: "awning",
      body:
        "Hinged at the top and pushed outward from the bottom. The open sash forms a small canopy, so you can keep some airflow when it drizzles. Often used in bathrooms or above fixed glass.",
      bestFor: ["Bathrooms & utility rooms", "High-placed ventilation", "Pairing with fixed panels"],
    },
    {
      id: "fixed-window",
      cat: "windows",
      name: "Fixed Windows",
      tagline: "Non-opening glass for light and uninterrupted views.",
      img: "assets/img/fixed-window", // [STOCK] illustrative
      op: "fixed",
      body:
        "A sealed frame with no moving parts — the simplest way to bring in daylight and frame a view. Often combined with sliding, casement or awning sections.",
      bestFor: ["Stairwells & high walls", "Picture windows", "Combining with opening sashes"],
    },
    {
      id: "corner-window",
      cat: "windows",
      name: "Corner Windows",
      tagline: "Glass that wraps around a corner for wider views.",
      img: "assets/img/corner-window", // [STOCK] illustrative
      op: "corner",
      body:
        "Two window runs meet at a building corner, opening up the room to light from two directions. A strong architectural feature for modern homes.",
      bestFor: ["Modern façades", "Living rooms & master bedrooms", "Brightening dark corners"],
    },
    {
      id: "sliding-door",
      cat: "doors",
      name: "Sliding Doors",
      tagline: "Wide glass panels that open your living space outdoors.",
      img: "assets/img/sliding-door", // [STOCK] illustrative
      op: "slide-door",
      body:
        "Large glass panels slide past each other on a track — no door swing to plan around. Ideal for patios, balconies, garden and terrace access.",
      bestFor: ["Patio, garden & terrace access", "Balconies", "Main living areas"],
    },
    {
      id: "casement-door",
      cat: "doors",
      name: "Casement & French-Type Doors",
      tagline: "Hinged doors — single or a classic French pair.",
      img: "assets/img/casement-door", // [STOCK] illustrative
      op: "french",
      body:
        "Hinged doors that swing open. French-type designs use a pair of glazed doors that open from the middle for a wide, elegant entrance.",
      bestFor: ["Main & side entrances", "Balcony doors", "Wide, symmetrical openings"],
    },
    {
      id: "shower-enclosure",
      cat: "glass",
      name: "Shower Enclosures",
      tagline: "Clean, glass-enclosed showers for modern bathrooms.",
      img: "assets/img/shower-enclosure", // [STOCK] illustrative
      body:
        "Glass enclosures that keep water inside the shower area and make a bathroom feel bigger and brighter.",
      bestFor: ["Master & guest bathrooms", "Small bathrooms that need to feel bigger"],
    },
    {
      id: "railings-curtain-wall",
      cat: "glass",
      name: "Glass Railings & Curtain Wall",
      tagline: "Open views on stairs, balconies and façades.",
      img: "assets/img/railings", // [STOCK] illustrative
      body:
        "Glass railings keep stairs and balconies safe without blocking the view. Curtain walls are large glass façade systems for a bold, modern exterior.",
      bestFor: ["Stairs & balconies", "Modern façades", "Commercial frontages"],
    },
    {
      id: "skylight-canopy",
      cat: "glass",
      name: "Skylights & Canopies",
      tagline: "Daylight from above; cover over entrances.",
      img: "assets/img/skylight", // [STOCK] illustrative
      body:
        "Skylights bring daylight into rooms and stairwells from the roof. Canopies give entrances, terraces and carports cover from sun and rain.",
      bestFor: ["Stairwells & dark rooms", "Entrances & garages", "Terraces"],
    },
    {
      id: "office-partition",
      cat: "glass",
      name: "Office Glass Partitions",
      tagline: "Divide office space without losing light.",
      img: "assets/img/office-partition", // [STOCK] illustrative
      body:
        "Glass partitions create meeting rooms and private offices while keeping the workplace open and bright.",
      bestFor: ["Offices & clinics", "Meeting rooms", "Shops & showrooms"],
    },
    {
      id: "kitchen-cabinet",
      cat: "glass",
      name: "Kitchen Cabinets",
      tagline: "Made-to-fit cabinets for your kitchen.",
      img: "assets/img/kitchen-cabinet", // [STOCK] illustrative
      body:
        "Cabinets built to your kitchen's layout. Ask ARTEM about materials and finishes available.", // [CONFIRM] material
      bestFor: ["New kitchens", "Kitchen renovations"],
    },
    {
      id: "framing",
      cat: "glass",
      name: "uPVC & Aluminum Framing",
      tagline: "Framing work for custom openings and projects.",
      img: "assets/img/framing", // [STOCK] illustrative
      body:
        "uPVC and aluminum framing for openings and projects that need a custom solution. Send your plan or photos and ARTEM will advise.",
      bestFor: ["Contractors & builders", "Custom openings", "Commercial spaces"],
    },
  ],

  /* ------------------------------------------------------------------ */
  /* PROJECT GALLERY — intentionally EMPTY.
     The site shows clearly-labelled placeholder frames until real ARTEM
     installation photos are added. Add entries like:
       { img: "assets/img/projects/lubao-sliding-door",   // + -800.jpg / -1600.jpg files
         title: "Sliding door, wood finish", place: "Lubao, Pampanga", tag: "doors" }
     Only add a "place" if the owner confirms it.                        */
  projects: [],

  /* ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------ */
  /* FINISHES — illustrative photos for the finish picker [STOCK].       */
  finishes: [
    { id: "white", name: "White", img: "assets/img/finish-white", note: "Clean and bright — the classic choice." },
    { id: "black", name: "Black", img: "assets/img/finish-black", note: "Sharp, modern lines for contemporary homes." },
    { id: "wood", name: "Wood finish", img: "assets/img/finish-wood", note: "Laminated wood look — warm, without the anay." },
  ],

  /* ------------------------------------------------------------------ */
  /* DESIGN INSPIRATION GALLERY — ALL [STOCK], clearly labelled on the
     page as illustrative. These are NOT ARTEM installations.
     tags: "exterior" | "doors" | "windows"                              */
  inspiration: [
    { img: "assets/img/insp-beach-house", title: "Glass-front modern home", tags: ["exterior"], src: "Pexels" },
    { img: "assets/img/insp-pool-house", title: "Wide sliding doors to the pool", tags: ["exterior", "doors"], src: "Unsplash" },
    { img: "assets/img/insp-dusk", title: "Full-height glazing at dusk", tags: ["exterior", "windows"], src: "Pexels" },
    { img: "assets/img/corner-window", title: "Floor-to-ceiling black frames", tags: ["windows"], src: "Pexels" },
    { img: "assets/img/insp-patio-doors", title: "Black sliding doors to the patio", tags: ["exterior", "doors"], src: "Pexels" },
    { img: "assets/img/insp-wood-windows", title: "Wood-tone frames, garden view", tags: ["windows"], src: "Pexels" },
    { img: "assets/img/insp-tropical-house", title: "Tropical modern façade", tags: ["exterior", "windows"], src: "Unsplash" },
    { img: "assets/img/insp-deck-door", title: "Sliding door onto the deck", tags: ["doors"], src: "Pexels" },
    { img: "assets/img/insp-designer", title: "Tall slot windows, wood cladding", tags: ["exterior", "windows"], src: "Pexels" },
    { img: "assets/img/insp-french-room", title: "White French door & black windows", tags: ["doors", "windows"], src: "Unsplash" },
    { img: "assets/img/insp-wood-house", title: "Warm wood & glass", tags: ["exterior"], src: "Unsplash" },
    { img: "assets/img/insp-sunlit", title: "Sunlit room, glass doors", tags: ["doors"], src: "Pexels" },
  ],

  faq: [
    {
      q: "Is the quotation really free?",
      a: "Yes. ARTEM offers a free quotation / estimate. Send your window or door sizes, quantity and location through the form, Messenger or a call.", // [FB]
    },
    {
      q: "What colors or finishes are available?",
      a: "uPVC profiles in white, black and laminated wood finish. Ask which finishes are available for the specific product you want.", // [FB]
    },
    {
      q: "What does the warranty cover?",
      a: "ARTEM advertises a 10-year warranty on the uPVC profile. Ask for the full warranty terms with your quotation.", // [FB] [CONFIRM terms]
    },
    {
      q: "Will uPVC rust, get termites or turn yellow?",
      a: "uPVC is a plastic-based material, so it does not rust and termites do not eat it. ARTEM's profiles are advertised as no rust, no termites (anay), no warping, no shrinkage and no yellowing.", // [FB] + material property
    },
    {
      q: "Do you offer double-glazed glass?",
      a: "Yes, double-glazed glass is one of the options ARTEM offers. Double glazing generally helps reduce outside noise and heat transfer compared with single glass.", // [FB] list item; benefit is general
    },
    {
      q: "Do you install outside Lubao, Pampanga?",
      a: "ARTEM is based in Sto. Niño, Lubao, Pampanga. Send your project location when you ask for a quotation and the team will confirm if they can serve your area.", // [CONFIRM service area]
    },
    {
      q: "What do I need to prepare before asking for a quote?",
      a: "Approximate width × height of each opening, how many units, the type you want (sliding, casement, etc.), your preferred finish, and the project location. Photos of the openings or your floor plan help a lot.",
    },
    {
      q: "I'm a contractor / developer. Can you handle bigger projects?",
      a: "Send your plans, schedule and window/door schedule through the form or email and the team will get back to you to discuss the scope.", // [CONFIRM capacity]
    },
  ],
};
