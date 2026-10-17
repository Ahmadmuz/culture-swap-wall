/* Culture Swap Wall — demonstration content.
   Every story below is fictional and written for this prototype. Names are
   invented, and each story is labelled as demonstration content in the UI.
   Nothing here should be treated as a factual account of a real community. */
window.CSW = window.CSW || {};

window.CSW.categories = [
  { id: "food", label: "Food", colour: "sand" },
  { id: "music", label: "Music", colour: "teal" },
  { id: "greeting", label: "Greeting", colour: "rose" },
  { id: "art", label: "Art", colour: "sage" },
  { id: "celebration", label: "Celebration", colour: "gold" },
  { id: "everyday", label: "Everyday Life", colour: "cream" }
];

window.CSW.stories = [
  {
    id: "lemon-cardamom-tea",
    title: "Lemon and cardamom tea",
    category: "food",
    region: "West Asia",
    author: "Samira K.",
    authorNote: "Demonstration author",
    summary: "The tea my grandmother makes when someone arrives without warning.",
    image: "tile-tea.svg",
    readingTime: "2 min",
    featured: true,
    context: [
      "In my grandmother's house, the kettle goes on before anyone sits down. The tea is black, steeped with cardamom, and poured into small glasses with a lot of sugar. If there is lemon, she adds a slice; if there is not, she says the tea is better without it.",
      "She learned it from her mother, but the recipe is not fixed. One aunt uses more cardamom. A cousin adds mint. The point is not the exact mixture. The point is that the tea appears quickly, so a visitor knows they are welcome to stay."
    ],
    means: "For me, the tea is a way of making time for someone. It says: I have stopped what I was doing.",
    understand: "That hospitality can be a small, ordinary act rather than a big gesture, and that a recipe can change without stopping being yours.",
    assumptions: "Please do not assume that every family from the same region makes tea the same way, or that the version I described is the \u2018real\u2019 one. There are many.",
    audioText: "Welcome. The kettle is on. This is the tea my grandmother makes when someone arrives without warning.",
    questions: [
      "What drink or food appears in your family when a visitor arrives?",
      "Is there a recipe in your family that everyone argues about?",
      "What does being welcomed look like where you are from?"
    ],
    reflections: [
      "Before I read this, I assumed that hospitality meant a big meal. This story made me think about small rituals.",
      "I noticed that the recipe changes between relatives. That made me think about how traditions stay alive.",
      "It reminded me of something my own family does, even though the details are different."
    ]
  },
  {
    id: "repaired-hand-drum",
    title: "The hand drum my uncle repaired",
    category: "music",
    region: "West Africa",
    author: "Kofi A.",
    authorNote: "Demonstration author",
    summary: "A drum with a new skin, and the afternoon my uncle taught me the first pattern.",
    image: "tile-drum.svg",
    readingTime: "2 min",
    featured: true,
    context: [
      "The drum had been in the family for years, but the skin had torn. My uncle stretched a new hide over the rim and left it to dry in the shade. He did not let me touch it for two days.",
      "When it was ready, he showed me a pattern: three hits with the right hand, then a pause, then two with the left. I was terrible at it. He laughed, but he kept saying \u2018listen first\u2019. The pattern was not just a rhythm; it was a way of answering the person leading the call."
    ],
    means: "The drum is not a decoration in our house. It is something you use, repair and pass on.",
    understand: "That music can be a conversation with rules of listening, and that an instrument carries family history as well as sound.",
    assumptions: "Please do not assume that all drumming from West Africa is the same. Rhythms belong to particular places, occasions and families, and I am only describing mine.",
    audioText: "Listen first, my uncle said. Then answer. This is the pattern he taught me.",
    questions: [
      "Is there an instrument that matters in your family?",
      "Who taught you to listen to music?",
      "What is a sound that makes you feel at home?"
    ],
    reflections: [
      "I had never thought of rhythm as a conversation before.",
      "The idea of repairing something rather than replacing it stayed with me.",
      "It made me think about the objects in my house that have a history."
    ]
  },
  {
    id: "three-kisses",
    title: "Three kisses, or one?",
    category: "greeting",
    region: "Southern Europe",
    author: "Elena P.",
    authorNote: "Demonstration author",
    summary: "A greeting that changes depending on who is in the room \u2014 and what happens when you get it wrong.",
    image: "tile-greeting.svg",
    readingTime: "2 min",
    featured: false,
    context: [
      "In my family, you greet people with a kiss on each cheek. Sometimes three, depending on which side of the family you are visiting. When I was small, I got it wrong constantly and kissed the air in the wrong place.",
      "The pandemic changed it. For a while we waved. Some older relatives still prefer a nod. Now I wait a second to see what the other person does, because the rule is not really a rule; it is a negotiation."
    ],
    means: "The greeting is a way of saying \u2018I see you\u2019, but the form of it is not the important part.",
    understand: "That greeting customs vary within families as well as between countries, and that asking or waiting is more respectful than assuming.",
    assumptions: "Please do not assume that everyone from my country greets people this way, or that everyone wants to be touched. Some people do not, and that is fine.",
    audioText: "Two kisses, sometimes three. Now I wait a second to see what the other person does.",
    questions: [
      "How do people greet each other in your family?",
      "Has a greeting custom changed in your lifetime?",
      "What is a respectful way to greet someone when you are not sure?"
    ],
    reflections: [
      "I never thought about greeting as something you negotiate.",
      "It made me realise that I assume things about greeting customs too.",
      "The line about waiting a second felt like a small, useful rule."
    ]
  },
  {
    id: "indigo-cloth",
    title: "My grandmother's indigo cloth",
    category: "art",
    region: "South Asia",
    author: "Amina R.",
    authorNote: "Demonstration author",
    summary: "A length of indigo cloth, a pattern that is slightly different every time, and a wedding.",
    image: "tile-indigo.svg",
    readingTime: "3 min",
    featured: true,
    context: [
      "The cloth was dyed in indigo, again and again, until the blue was almost black. My grandmother says the colour deepens with each dip. The pattern was stamped by hand, so the repeats are not perfect.",
      "It was made for a wedding in the family. After the wedding, it was folded away with neem leaves. I am not allowed to wear it yet. When I am older, my mother says, it will be mine, and I will have to decide what to do with it."
    ],
    means: "The cloth is not just beautiful. It is a record of who made it and what it was for.",
    understand: "That a craft object can carry family memory and technical knowledge at the same time, and that imperfection can be evidence of a person's hand.",
    assumptions: "Please do not assume that this pattern represents a whole region or religion. Designs vary by place, maker and occasion, and some patterns are not mine to explain.",
    audioText: "Each dip makes the blue deeper. The stamps are by hand, so no two repeats are exactly the same.",
    questions: [
      "Is there an object in your family that is kept rather than used?",
      "What is something handmade that you would want to keep?",
      "Who decides what happens to family objects?"
    ],
    reflections: [
      "The idea that the imperfections show the maker's hand stayed with me.",
      "It made me think about the things my family keeps in cupboards.",
      "I want to ask my grandmother about the objects she has kept."
    ]
  },
  {
    id: "new-year-dumplings",
    title: "New Year's Eve dumplings",
    category: "celebration",
    region: "East Asia",
    author: "Mei L.",
    authorNote: "Demonstration author",
    summary: "Folding dumplings with three generations at one table, and the one that is different.",
    image: "tile-dumplings.svg",
    readingTime: "2 min",
    featured: true,
    context: [
      "On New Year's Eve, the table is covered with flour and everyone folds. My grandmother makes the dough, my mother makes the filling, and the children are allowed to make \u2018interesting\u2019 shapes that nobody eats.",
      "One dumpling is different. In my family it is a dumpling with a little extra filling, and whoever finds it is supposed to have a good year. It is not a competition, but everyone checks their bowl."
    ],
    means: "The dumplings are less about the food than about everyone being at the same table at the same time.",
    understand: "That a celebration can hold both a very old story and a very ordinary family argument about who folds the best dumpling.",
    assumptions: "Please do not assume that everyone from East Asia celebrates the same new year, or eats the same food. This is one family's version.",
    audioText: "The table is covered in flour. Everyone folds. The children make shapes nobody eats.",
    questions: [
      "What food means celebration in your family?",
      "Is there a tradition that only makes sense inside your family?",
      "Who is usually missing from the table, and how do you remember them?"
    ],
    reflections: [
      "It made me think about the foods that only appear once a year.",
      "I liked that the tradition included the children making bad dumplings.",
      "It reminded me that celebrations are also a lot of work."
    ]
  },
  {
    id: "balcony-garden",
    title: "The balcony garden",
    category: "everyday",
    region: "Oceania",
    author: "Rua T.",
    authorNote: "Demonstration author",
    summary: "Taro, mint and chilli growing in buckets outside a third-floor flat.",
    image: "tile-garden.svg",
    readingTime: "2 min",
    featured: false,
    context: [
      "There is no garden at our flat, so my dad grows things in buckets on the balcony. Taro in one, mint in another, chilli in an old paint tin. He talks to them. The neighbours probably think he is strange.",
      "The taro is the important one. It reminds him of the garden at his mother's house. When it is ready, we cook it and take some to the neighbour who looks after the mail when we are away."
    ],
    means: "The balcony is a small piece of home, and a way of staying connected to a place we do not live in anymore.",
    understand: "That growing food can be about memory and relationship, not only about saving money or being self-sufficient.",
    assumptions: "Please do not assume that this is how everyone from my background lives, or that growing food in a city is unusual. Plenty of people do it for plenty of reasons.",
    audioText: "No garden, so we use buckets. Taro, mint, chilli. My dad talks to them.",
    questions: [
      "Is there something growing where you live?",
      "What food makes a place feel like home?",
      "Who do you share food with?"
    ],
    reflections: [
      "I liked the idea of a garden that fits on a balcony.",
      "It made me think about the things my family does to remember home.",
      "The neighbour getting taro was a nice detail."
    ]
  },
  {
    id: "harvest-song",
    title: "A song for the end of harvest",
    category: "music",
    region: "South America",
    author: "Luc\u00eda M.",
    authorNote: "Demonstration author",
    summary: "A call-and-response song sung by workers at the end of the grape harvest.",
    image: "tile-harvest.svg",
    readingTime: "2 min",
    featured: false,
    context: [
      "The song is sung at the end of the harvest, when the last rows are finished. One person calls a line and everyone answers. It is not a performance for an audience; it is a way of marking the end of weeks of work.",
      "My grandfather taught me the response, not the call. He said the call belongs to whoever is leading that day. I have only heard it a few times, but I know the response by heart."
    ],
    means: "The song is a way of saying that the work is finished and that we did it together.",
    understand: "That some songs are for a specific moment and a specific group of people, and that hearing them outside that moment changes them.",
    assumptions: "Please do not assume that this is a famous song or that everyone in the region knows it. It belongs to a particular place and a particular kind of work.",
    audioText: "One person calls. Everyone answers. It is not a performance; it is a way of finishing.",
    questions: [
      "Is there a song that belongs to a particular job or season?",
      "What do you sing when you are working with other people?",
      "What makes a song feel like it belongs to a place?"
    ],
    reflections: [
      "I had never thought of a song as a way of marking the end of work.",
      "The difference between the call and the response was interesting.",
      "It made me think about the songs I only hear at certain times."
    ]
  },
  {
    id: "welcome-chair",
    title: "The welcome chair",
    category: "everyday",
    region: "East Africa",
    author: "Hana B.",
    authorNote: "Demonstration author",
    summary: "A chair by the door that is always kept free, and who gets to sit in it.",
    image: "tile-chair.svg",
    readingTime: "2 min",
    featured: false,
    context: [
      "There is a chair by the door in my grandmother's house that nobody uses. It is for visitors. If an older person arrives, they get the chair and someone else stands.",
      "When I was little, I thought it was a rule about furniture. Now I think it is a rule about attention. The chair is a way of noticing who has arrived and making sure they are comfortable before anything else happens."
    ],
    means: "The chair is a small piece of etiquette that tells you what a household values.",
    understand: "That hospitality can be built into the arrangement of a room, not only into what people say.",
    assumptions: "Please do not assume that every household does this, or that the same arrangement means the same thing everywhere.",
    audioText: "The chair by the door is for visitors. If an elder arrives, they sit, and someone else stands.",
    questions: [
      "Is there a place in your home where visitors sit?",
      "What does your family do when an elder arrives?",
      "How can a room show respect?"
    ],
    reflections: [
      "I never noticed how much furniture can say about a family.",
      "It made me think about the chair nobody uses in my own house.",
      "The idea of a rule about attention was new to me."
    ]
  }
];

window.CSW.pendingDemo = [
  {
    id: "demo-mango-pickle",
    title: "A recipe for mango pickle",
    category: "food",
    region: "South Asia",
    author: "Demo contributor",
    summary: "A family recipe with a photograph of a handwritten recipe card.",
    submitted: "2026-10-16T09:20:00",
    flags: ["Photograph of a handwritten recipe card", "Consent confirmed for the image"],
    status: "pending",
    story: {
      id: "demo-mango-pickle",
      title: "A recipe for mango pickle",
      category: "food",
      region: "South Asia",
      author: "Demo contributor",
      authorNote: "Demonstration author",
      summary: "My mother's mango pickle, written on the back of an old card.",
      context: [
        "The recipe is written on the back of a card in my mother's handwriting, with amounts crossed out and replaced. She makes it once a year, when the mangoes are cheap, and gives jars to people who helped us during the year.",
        "The card is not the original. The original was lost, and this version was copied from memory, which is why one line says \u2018ask Aunty about the fenugreek\u2019."
      ],
      means: "The card is a record of a year's work and of the people my mother wants to thank.",
      understand: "That a recipe can be a working document and a record of obligation, not just instructions.",
      assumptions: "Please do not assume this is a standard recipe. Every family's pickle is different, and mine is not the definitive version.",
      image: "tile-cat-food.svg",
      readingTime: "2 min",
      community: true
    }
  }
];

window.CSW.regions = [
  { id: "west-asia", label: "West Asia", note: "One family's tea ritual." },
  { id: "west-africa", label: "West Africa", note: "A repaired drum and a first rhythm." },
  { id: "southern-europe", label: "Southern Europe", note: "Greetings that change with the room." },
  { id: "south-asia", label: "South Asia", note: "Indigo cloth and a family recipe." },
  { id: "east-asia", label: "East Asia", note: "New Year dumplings." },
  { id: "oceania", label: "Oceania", note: "A balcony garden." },
  { id: "south-america", label: "South America", note: "A harvest song." },
  { id: "east-africa", label: "East Africa", note: "A chair kept for visitors." }
];

window.CSW.bridgePrompts = {
  question: [
    "What would you like to ask the person who shared this?",
    "Which detail made you curious, and why?",
    "What would you like to understand better about this story?"
  ],
  reflection: [
    "What did you assume before you read this? What changed?",
    "Does this remind you of something in your own family? What is similar, and what is different?",
    "What is one thing you would not have known without this story?"
  ],
  thanks: [
    "Thank you for sharing something ordinary and specific.",
    "I appreciated learning about the detail you chose to describe.",
    "Thank you for explaining what this means to you."
  ]
};
