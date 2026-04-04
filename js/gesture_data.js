const GESTURE_META = {
  curled_finger: {
    key: "curled_finger",
    name: "Curled Finger",
    image: "image_newest/curled finger.PNG"
  },
  curled_finger_down: {
    key: "curled_finger_down",
    name: "Curled Finger Down",
    image: "image_newest/curldown.PNG"
  },
  horns: {
    key: "horns",
    name: "Horns",
    image: "image_newest/horns.PNG"
  },
  little_finger: {
    key: "little_finger",
    name: "Little Finger",
    image: "image_newest/little finger.PNG"
  },
  middle_finger: {
    key: "middle_finger",
    name: "Middle Finger",
    image: "image_newest/middlefinger.PNG"
  },
  ok: {
    key: "ok",
    name: "OK",
    image: "image_newest/ok.PNG"
  },
  open_palm_with_fingers_spread: {
    key: "open_palm_with_fingers_spread",
    name: "Open Palm",
    image: "image_newest/open palm.PNG"
  },
  raise_index_finger: {
    key: "raise_index_finger",
    name: "Index Finger",
    image: "image_newest/index finger.PNG"
  },
  serbian_salute: {
    key: "serbian_salute",
    name: "Serbian Salute",
    image: "image_newest/serbian three.PNG"
  },
  shocker: {
    key: "shocker",
    name: "Shocker",
    image: "image_newest/shocker.PNG"
  },
  six_hand: {
    key: "six_hand",
    name: "Six Hand",
    image: "image_newest/hand6.PNG"
  },
  three_finger_salute: {
    key: "three_finger_salute",
    name: "Three-Finger Salute",
    image: "image_newest/three finger salute.PNG"
  },
  thumbs_up: {
    key: "thumbs_up",
    name: "Thumbs Up",
    image: "image_newest/thumbs up.PNG"
  },
  v_sign: {
    key: "v_sign",
    name: "V Sign",
    image: "image_newest/v fingers.PNG"
  }
};
//////////////////////////////////////////////



const GESTURE_DATA = {
  curled_finger: {
    name: "Curled finger",
    emoji: "",
    description: "A gesture where the index finger sticks out of a clenched fist, with the palm facing the gesturer.",
    countries: [
      {
        code: "JP",
        name: "Japan",
        flag: "🇯🇵",
        type: "negative",
        meaning: "come here",
        detail: "In Japan, curling the finger toward oneself is commonly used as a gesture to beckon someone to come closer."
      },
      {
        code: "CN",
        name: "China",
        flag: "🇨🇳",
        type: "negative",
        meaning: "it suggests disrespect",
        detail: "In China, beckoning someone using a curled finger may be interpreted as disrespectful in certain social contexts."
      },
      {
        code: "KR",
        name: "South Korea",
        flag: "🇰🇷",
        type: "negative",
        meaning: "it's highly disrespectful ",
        detail: "In South Korea, beckoning someone with a curled finger may be interpreted as highly disrespectful."
      },
      {
        code: "MN",
        name: "Mongolia",
        flag: "🇲🇳",
        type: "negative",
        meaning: "very disrespectful",
        detail: "In Mongolia, beckoning someone with a curled finger may be perceived as disrespectful."
      },
      {
        code: "US",
        name: "United States of America",
        flag: "🇺🇸",
        type: "negative",
        meaning: "come towards me",
        detail: "In the United States, curling the finger toward oneself is commonly used to beckon someone to come closer."
      },
      {
        code: "CA",
        name: "Canada",
        flag: "🇨🇦",
        type: "positive",
        meaning: "come here",
        detail: "In Canada, curling the finger toward oneself is commonly used to signal someone to come here."
      },
      {
        code: "PH",
        name: "Philippines",
        flag: "🇵🇭",
        type: "negative",
        meaning: "it's like someone asking you for a fight ",
        detail: "In the Philippines, beckoning with a curled finger may sometimes be interpreted as confrontational or provocative."
      },
      {
        code: "VN",
        name: "Vietnam",
        flag: "🇻🇳",
        type: "negative",
        meaning: "it means that the person has to come forward.",
        detail: "In Vietnam, beckoning with a curled finger is commonly used to signal someone to come forward."
      },
      {
        code: "SG",
        name: "Singapore",
        flag: "🇸🇬",
        type: "negative",
        meaning: "showing another people inferiority",
        detail: "In Singapore, beckoning someone with a curled finger may be interpreted as implying superiority or disrespect."
      },
      {
        code: "BW",
        name: "Botswana",
        flag: "🇧🇼",
        type: "neutral",
        meaning: "it means come here.",
        detail: "In Botswana, beckoning with a curled finger is commonly used to signal someone to come closer."
      },
      {
        code: "GR",
        name: "Greece",
        flag: "🇬🇷",
        type: "positive",
        meaning: "come here",
        detail: "In Greece, beckoning with a curled finger is commonly used to signal someone to come closer."
      },
      {
        code: "GE",
        name: "Georgia",
        flag: "🇬🇪",
        type: "neutral",
        meaning: "a sign for hook",
        detail: "In Georgia, beckoning with a curled finger may be used to signal someone or hook their attention."
      }
    ]
  },
  curled_finger_down: {
    name: "Curled finger down",
    emoji: "",
    description: "A gesture where the index finger is extended and bent downward while the other fingers remain relaxed or curled.",
    countries: [
      {
        code: "CN",
        name: "China",
        flag: "🇨🇳",
        type: "neutral",
        meaning: "It's a number 9",
        detail: "In China, bending the index finger downward is used as a hand gesture to represent the number nine, as part of a unique finger-counting system."
      },
      {
        code: "MX",
        name: "Mexico",
        flag: "🇲🇽",
        type: "neutral",
        meaning: "Money",
        detail: "In Mexico, bending the index finger downward is sometimes used in informal contexts to money or payment"
      },
      {
        code: "PH",
        name: "Myanmar",
        flag: "🇵🇭",
        type: "negative",
        meaning: "Death",
        detail: "In Mexico, bending the index finger downward usally means death."
      },
      {
        code: "JP",
        name: "Japan",
        flag: "🇯🇵",
        type: "neutral",
        meaning: "theft",
        detail: "In Japan, bending the index finger downward can resemble the action of hooking or snatching something"
      }
    ]
  },
  horns: {
    name: "Horns",
    emoji: "",
    description: "A gesture where the index and little fingers are extended while holding the middle and ring fingers down.",
    countries: [
      {
        code: "MX",
        name: "Mexico",
        flag: "🇲🇽",
        type: "neutral",
        meaning: "this means like \"yreaaah, rock\"",
        detail: "In Mexico, the horns gesture is commonly associated with rock or heavy metal culture and is used to express enthusiasm for music."
      },
      {
        code: "SK",
        name: "Slovakia",
        flag: "🇸🇰",
        type: "positive",
        meaning: "as a part of rock culture",
        detail: "In Slovakia, the horns gesture is often associated with rock or heavy metal music culture."
      },
      {
        code: "US",
        name: "United States of America",
        flag: "🇺🇸",
        type: "positive",
        meaning: "Rock and roll type symbol",
        detail: "In the United States, the horns gesture is widely associated with rock and heavy metal music culture and expresses enthusiasm."
      },
      {
        code: "CA",
        name: "Canada",
        flag: "🇨🇦",
        type: "positive",
        meaning: "in canada this means rock on.",
        detail: "In Canada, the horns gesture is commonly associated with rock music culture and used to express excitement or support."
      },
      {
        code: "AR",
        name: "Argentina",
        flag: "🇦🇷",
        type: "positive",
        meaning: "it is mostly occupied by people who like rock.",
        detail: "In Argentina, the horns gesture is often associated with rock music culture and fans of the genre."
      },
      {
        code: "BR",
        name: "Brazil",
        flag: "🇧🇷",
        type: "negative",
        meaning: "People relate it to infidelity, so it's like accusing someone of such.",
        detail: "In Brazil, the horns gesture is commonly associated with heavy metal or rock music culture."
      },
      {
        code: "CO",
        name: "Colombia",
        flag: "🇨🇴",
        type: "neutral",
        meaning: "it may be related to the heavy metal gesture",
        detail: "In Colombia, the horns gesture may be related to rock or heavy metal music culture."
      },
      {
        code: "IT",
        name: "Italy",
        flag: "🇮🇹",
        type: "negative",
        meaning: "infidelity or humiliation",
        detail: "In Italy, the horns gesture may symbolize infidelity or humiliation in certain contexts."
      },
      {
        code: "ES",
        name: "Spain",
        flag: "🇪🇸",
        type: "negative",
        meaning: "hostile intentions",
        detail: "In Spain, the horns gesture may be interpreted as implying hostile intentions."
      },
      {
        code: "GR",
        name: "Greece",
        flag: "🇬🇷",
        type: "positive",
        meaning: "very offense,putting up the horns.",
        detail: "In Greece, the horns gesture can be considered highly offensive in certain contexts."
      },
      {
        code: "PT",
        name: "Portugal",
        flag: "🇵🇹",
        type: "negative",
        meaning: "can be considerated offensive;",
        detail: "In Portugal, the horns gesture may be considered offensive depending on context."
      },
      {
        code: "FR",
        name: "France",
        flag: "🇫🇷",
        type: "negative",
        meaning: "someone is being cheated on",
        detail: "In France, the horns gesture is often used to suggest that someone is being cheated on by their partner"
      }
    ]
  },
  little_finger: {
    name: "Little finger",
    emoji: "",
    description: "A gesture where the little finger is extended while the other fingers are folded or relaxed.",
    countries: [
      {
        code: "KR",
        name: "South Korea",
        flag: "🇰🇷",
        type: "neutral",
        meaning: "girlfriend or wife",
        detail: "In South Korea, extending the little finger is commonly used to refer to one’s girlfriend or wife in a symbolic way"
      },
      {
        code: "PH",
        name: "Philippines",
        flag: "🇵🇭",
        type: "negative",
        meaning: "It means small or short person in an offensive way",
        detail: "In the Philippines, extending the little finger can be used to describe or someone who is small or short in size, especially in an offensive way."
      },
      {
        code: "JP",
        name: "Japan",
        flag: "🇯🇵",
        type: "neutral",
        meaning: "It means lover or woman",
        detail: "In Japan, extending the little finger is often used to represent a lover or a woman, especially in a romantic context"
      },
      {
        code: "IN",
        name: "India",
        flag: "🇮🇳",
        type: "neutral",
        meaning: "It means going to the toilet",
        detail: "In India, extending the little finger can be used to indicate the need to go to the toilet, especially among children"
      },
      {
        code: "MM",
        name: "Myanmar",
        flag: "🇲🇲",
        type: "neutral",
        meaning: "It means going to the toilet",
        detail: "In Myanmar, extending the little finger can be used to indicate the need to go to the toilet"
      },
      {
        code: "US",
        name: "United States of America",
        flag: "🇺🇸",
        type: "neutral",
        meaning: "bet",
        detail: "In the United States, extending the little finger can sometimes be used in informal contexts to indicate making a bet or promise"
      },
      {
        code: "NG",
        name: "Nigeria",
        flag: "🇳🇬",
        type: "neutral",
        meaning: "It means bet",
        detail: "In Nigeria, extending the little finger can also be used to indicate making a bet in casual situations"
      }
    ]
  },
  middle_finger: {
    name: "Middle Finger",
    emoji: "",
    description: "A gestures showing the back of the hand with only the middle finger extended.",
    countries: [
      {
        code: "CN",
        name: "China",
        flag: "🇨🇳",
        type: "negative",
        meaning: "this gesture means \"offensive gesture\" in china.",
        detail: "In China, the middle finger gesture is widely recognized as a rude and offensive insult directed at another person."
      },
      {
        code: "RU",
        name: "Russia",
        flag: "🇷🇺",
        type: "negative",
        meaning: "it's form of nonverbal \"offensive gesture off\"",
        detail: "In Russia, the middle finger gesture is considered a strong and offensive insult directed at another person."
      },
      {
        code: "UA",
        name: "Ukraine",
        flag: "🇺🇦",
        type: "negative",
        meaning: "insult, desire to offend",
        detail: "In Ukraine, the middle finger gesture is widely recognized as a vulgar insult expressing anger or hostility."
      },
      {
        code: "CZ",
        name: "Czechia",
        flag: "🇨🇿",
        type: "negative",
        meaning: "It's a obscene gesture used to communicate contempt.",
        detail: "In Czechia, the middle finger gesture is widely recognized as a rude and offensive sign expressing anger or telling someone to go away."
      },
      {
        code: "US",
        name: "United States of America",
        flag: "🇺🇸",
        type: "negative",
        meaning: "rudeness and anger",
        detail: "In the United States, the middle finger gesture is widely recognized as a rude and offensive sign expressing anger or hostility."
      },
      {
        code: "CA",
        name: "Canada",
        flag: "🇨🇦",
        type: "negative",
        meaning: "Someone is very displeased with you and trying to express their anger",
        detail: "In Canada, the middle finger gesture is a vulgar sign used to insult someone or express strong anger."
      },
      {
        code: "GB",
        name: "United Kingdom",
        flag: "🇬🇧",
        type: "negative",
        meaning: "disrespectful and rude",
        detail: "In the United Kingdom, the middle finger gesture is widely recognized as an offensive insult."
      },
      {
        code: "MY",
        name: "Malaysia",
        flag: "🇲🇾",
        type: "negative",
        meaning: "middle finger means \"offensive gesture\"",
        detail: "In Malaysia, the middle finger gesture is widely recognized as a vulgar insult."
      },
      {
        code: "BW",
        name: "Botswana",
        flag: "🇧🇼",
        type: "negative",
        meaning: "telling someone to offensive gesture off",
        detail: "In Botswana, the middle finger gesture is recognized as a vulgar insult expressing anger."
      },
      {
        code: "IN",
        name: "India",
        flag: "🇮🇳",
        type: "negative",
        meaning: "the middle finger indicates the meaning of sexual intercourse.",
        detail: "In India, the middle finger gesture is commonly recognized as a vulgar or sexual insult."
      },
      {
        code: "PK",
        name: "Pakistan",
        flag: "🇵🇰",
        type: "negative",
        meaning: "direspectful and rude",
        detail: "In Pakistan, the middle finger gesture may be interpreted as an insulting gesture toward someone."
      },
      {
        code: "LK",
        name: "Sri Lanka",
        flag: "🇱🇰",
        type: "negative",
        meaning: "rude",
        detail: "In Sri Lanka, the middle finger gesture may be interpreted as an insulting gesture."
      },
      {
        code: "AD",
        name: "Andorra",
        flag: "🇦🇩",
        type: "negative",
        meaning: "telling someone to offensive gesture off",
        detail: "In Andorra, the middle finger gesture is widely recognized as a vulgar insult."
      },
      {
        code: "GE",
        name: "Georgia",
        flag: "🇬🇪",
        type: "negative",
        meaning: "offensive and disrespectful",
        detail: "In Georgia, the middle finger gesture is widely considered offensive and disrespectful, and it is typically used to express anger or insult toward someone."
      },
      {
        code: "AE",
        name: "United Arab Emirates",
        flag: "🇦🇪",
        type: "negative",
        meaning: "It implies that the person is trying to insult another person.",
        detail: "In the United Arab Emirates, the middle finger gesture may be interpreted as a highly offensive insult."
      },
      {
        code: "FR",
        name: "France",
        flag: "🇫🇷",
        type: "negative",
        meaning: "anger.",
        detail: "In France, the middle finger gesture expresses anger or disrespect."
      },
      {
        code: "DE",
        name: "Germany",
        flag: "🇩🇪",
        type: "negative",
        meaning: "it means offensive gesture",
        detail: "In Germany, the middle finger gesture is widely recognized as a vulgar insult."
      },
      {
        code: "LU",
        name: "Luxembourg",
        flag: "🇱🇺",
        type: "negative",
        meaning: "expressing disrespect and anger",
        detail: "In Luxembourg, the middle finger gesture is used to express anger or disrespect."
      }
    ]
  },
  ok: {
    name: "OK",
    emoji: "",
    description: "A gesture where thumb and index finger are joined in a circle, and the other fingers are held straight away from the palm.",
    countries: [
      {
        code: "CN",
        name: "China",
        flag: "🇨🇳",
        type: "positive",
        meaning: "it signifies that something is ok",
        detail: "In China, the OK gesture is generally understood as indicating agreement or that something is satisfactory."
      },
      {
        code: "RU",
        name: "Russia",
        flag: "🇷🇺",
        type: "positive",
        meaning: "ok, perfect",
        detail: "In Russia, the OK gesture generally indicates that something is fine or satisfactory."
      },
      {
        code: "TN",
        name: "Tunisia",
        flag: "🇹🇳",
        type: "negative",
        meaning: "rude",
        detail: "In Tunisia, the OK gesture may sometimes be interpreted as rude depending on the context in which it is used."
      },
      {
        code: "US",
        name: "United States of America",
        flag: "🇺🇸",
        type: "positive",
        meaning: "ok",
        detail: "In the United States, the OK gesture is commonly used to indicate agreement, approval, or that everything is satisfactory."
      },
      {
        code: "CA",
        name: "Canada",
        flag: "🇨🇦",
        type: "positive",
        meaning: "that everything is ok",
        detail: "In Canada, the OK gesture generally indicates that something is fine, correct, or acceptable."
      },
      {
        code: "BR",
        name: "Brazil",
        flag: "🇧🇷",
        type: "negative",
        meaning: "in brazil this one is equivalent to the middle finger",
        detail: "In Brazil, the OK gesture can be interpreted as a vulgar insult equivalent to the middle finger in some contexts. "
      },
      {
        code: "VE",
        name: "Venezuela",
        flag: "🇻🇪",
        type: "negative",
        meaning: "understood, ok, that's fine",
        detail: "In Venezuela, the OK gesture is generally used to indicate understanding, agreement, or that something is fine."
      },
      {
        code: "AR",
        name: "Argentina",
        flag: "🇦🇷",
        type: "positive",
        meaning: "to say okay, understood, no problem.",
        detail: "In Argentina, the OK gesture is commonly used to indicate agreement or that everything is acceptable."
      },
      {
        code: "UY",
        name: "Uruguay",
        flag: "🇺🇾",
        type: "positive",
        meaning: "just means ok.",
        detail: "In Uruguay, the OK gesture is generally interpreted as meaning that everything is fine or satisfactory."
      },
      {
        code: "NA",
        name: "Namibia",
        flag: "🇳🇦",
        type: "positive",
        meaning: "perfect",
        detail: "In Namibia, the OK gesture is generally interpreted as meaning that something is perfect or satisfactory."
      },
      {
        code: "GR",
        name: "Greece",
        flag: "🇬🇷",
        type: "positive",
        meaning: "means ok",
        detail: "In Greece, the OK gesture generally indicates that something is acceptable or satisfactory."
      },
      {
        code: "MT",
        name: "Malta",
        flag: "🇲🇹",
        type: "positive",
        meaning: "ok sign",
        detail: "In Malta, the OK gesture generally indicates agreement or that something is acceptable."
      },
      {
        code: "TR",
        name: "Turkey",
        flag: "🇹🇷",
        type: "negative",
        meaning: "it has homosexual connotations.",
        detail: "In Turkey, the OK gesture may sometimes carry sexual or offensive connotations."
      },
      {
        code: "KW",
        name: "Kuwait",
        flag: "🇰🇼",
        type: "negative",
        meaning: "desire to insult them",
        detail: "In Kuwait, the OK gesture may be interpreted as an insulting or offensive signal."
      },
      {
        code: "FR",
        name: "France",
        flag: "🇫🇷",
        type: "positive",
        meaning: "it means ok",
        detail: "In France, the OK gesture generally indicates agreement or that something is acceptable."
      },
      {
        code: "DE",
        name: "Germany",
        flag: "🇩🇪",
        type: "positive",
        meaning: "everything ok",
        detail: "In Germany, the OK gesture commonly means that everything is fine."
      },
      {
        code: "BE",
        name: "Belgium",
        flag: "🇧🇪",
        type: "positive",
        meaning: "more like a happy gesture",
        detail: "In Belgium, the OK gesture may also express happiness or satisfaction."
      },
      {
        code: "IL",
        name: "Israel",
        flag: "🇮🇱",
        type: "positive",
        meaning: "i am agree!",
        detail: "In Israel, the OK gesture is commonly used to indicate agreement or approval."
      }
    ]
  },
  open_palm_with_fingers_spread: {
    name: "Open palm with fingers spread",
    emoji: "",
    description: "A gesture where all the fingers are extended, with the palm facing someone.",
    countries: [
      {
        code: "MX",
        name: "Mexico",
        flag: "🇲🇽",
        type: "neutral",
        meaning: "it means to stop",
        detail: "In Mexico, displaying an open palm with fingers spread is often used as a signal telling someone to stop."
      },
      {
        code: "US",
        name: "United States of America",
        flag: "🇺🇸",
        type: "positive",
        meaning: "Wide meaning, friendly, stop, back off or grab someone's attention",
        detail: "In the United States, an open palm with fingers spread can carry several general meanings depending on the context, such as signaling friendliness, asking someone to stop or back off, or trying to grab someone's attention."
      },
      {
        code: "CA",
        name: "Canada",
        flag: "🇨🇦",
        type: "neutral",
        meaning: "rejection, disdain, or dismissal, often perceived as an aggressive or confrontational sign or an invitation to stop or back off",
        detail: "In Canada, the open palm gesture does not usually carry a specific cultural meaning and interpretations may vary."
      },
      {
        code: "IR",
        name: "Iran",
        flag: "🇮🇷",
        type: "neutral",
        meaning: "it is rejecting someone by showing them this hand gesture.",
        detail: "In Iran, displaying an open palm with fingers spread may be used to signal rejection toward someone."
      },
      {
        code: "PK",
        name: "Pakistan",
        flag: "🇵🇰",
        type: "negative",
        meaning: "disrespectful",
        detail: "In Pakistan, displaying an open palm with fingers spread may be interpreted as disrespectful."
      },
      {
        code: "GR",
        name: "Greece",
        flag: "🇬🇷",
        type: "negative",
        meaning: "it's an insult",
        detail: "In Greece, displaying an open palm with fingers spread may be interpreted as an insulting gesture."
      },
      {
        code: "IQ",
        name: "Iraq",
        flag: "🇮🇶",
        type: "negative",
        meaning: "in your face.",
        detail: "In Iraq, displaying an open palm with fingers spread may be interpreted as a confrontational gesture."
      }
    ]
  },
  raise_index_finger: {
    name: "Raise index finger",
    emoji: "",
    description: "A gesture where the index finger is extended or raised while the other fingers are curled inward toward the palm.",
    countries: [
      {
        code: "SG",
        name: "Singapore",
        flag: "🇸🇬",
        type: "netrual",
        meaning: "The most important thing",
        detail: "In Singapore, extending the index finger can be used to indicate that something is the most important or to emphasize priority"
      },
      {
        code: "MM",
        name: "Myanmar",
        flag: "🇲🇲",
        type: "positive",
        meaning: "Polite and say please",
        detail: "In Myanmar, extending the index finger can be used as a polite gesture to express a request or to say “please.”"
      },
      {
        code: "US",
        name: "United States of America",
        flag: "🇺🇸",
        type: "neutral",
        meaning: "hold on",
        detail: "In the United States, extending the index finger is sometimes used to signal someone to wait or hold on for a moment"
      },
      {
        code: "AU",
        name: "Australia",
        flag: "🇦🇺",
        type: "neutral",
        meaning: "one more beer",
        detail: "In Australia, extending the index finger in certain informal contexts can be used to indicate ordering another beer"
      }
    ]
  },
  serbian_salute: {
    name: "Serbian Salute",
    emoji: "",
    description: "A gesture where the thumb, index, and middle fingers are extended to form a salute.",
    countries: [
      {
        code: "US",
        name: "United States of America",
        flag: "🇺🇸",
        type: "positive",
        meaning: "peace",
        detail: "In the United States, the Serbian salute may be interpreted as a gesture associated with cultural identity or solidarity."
      },
      {
        code: "CA",
        name: "Canada",
        flag: "🇨🇦",
        type: "positive",
        meaning: "it would be a gesture of positive comradeship between serbians",
        detail: "In Canada, the Serbian salute may represent camaraderie or shared cultural identity among Serbian communities."
      },
      {
        code: "RS",
        name: "Serbia",
        flag: "🇷🇸",
        type: "positive",
        meaning: "welcome",
        detail: "In Serbia, the Serbian salute may be used as a gesture of greeting or welcome."
      },
      {
        code: "BA",
        name: "Bosnia and Herzegovina",
        flag: "🇧🇦",
        type: "negative",
        meaning: "some people say it refers to the holy trinity, but now a days is related to nationalist movements, usually with bad connotation.",
        detail: "In Bosnia and Herzegovina, the Serbian salute may be interpreted as referring to the Holy Trinity or associated with nationalist symbolism."
      }
    ]
  },
  shocker: {
    name: "Shocker",
    emoji: "",
    description: "A gesture where the index, middle, and little fingers are extended, while the ring finger is curled or bent down.",
    countries: [
      {
        code: "US",
        name: "United States of America",
        flag: "🇺🇸",
        type: "negative",
        meaning: "overall rude",
        detail: "In the United States, the shocker gesture is considered a crude sexual reference and is generally regarded as vulgar."
      },
      {
        code: "CA",
        name: "Canada",
        flag: "🇨🇦",
        type: "neutral",
        meaning: "sexual connotations",
        detail: "In Canada, the shocker gesture is interpreted as a crude sexual reference and is generally considered vulgar."
      },
      {
        code: "BW",
        name: "Botswana",
        flag: "🇧🇼",
        type: "positive",
        meaning: "greeting sign",
        detail: "In Botswana, the shocker gesture may sometimes be interpreted as a casual greeting sign in certain informal contexts."
      }
    ]
  },
  six_hand: {
    name: "Six hand",
    emoji: "",
    description: "A gesture where the thumb and little finger are extended outward while the index, middle, and ring fingers are curled inward.",
    countries: [
      {
        code: "US",
        name: "United States of America",
        flag: "🇺🇸",
        type: "neutral",
        meaning: "Phone call",
        detail: "In the United States, this gesture is often used to mean “call me”"
      },
      {
        code: "BR",
        name: "Brazil",
        flag: "🇧🇷",
        type: "negative",
        meaning: "misunderstood or offensive",
        detail: "In Brazil, using unfamiliar gestures can sometimes lead to unintended negative interpretations."
      },
      {
        code: "ES",
        name: "Spain",
        flag: "🇪🇸",
        type: "neutral",
        meaning: "Call me",
        detail: "In Spain, this gesture can be used informally to indicate “call me"
      },
      {
        code: "CN",
        name: "China",
        flag: "🇨🇳",
        type: "positive",
        meaning: "It means six or cool",
        detail: "In China, this gesture represents the number six in finger counting and is also widely used in slang to mean something is cool, smooth, or impressive."
      }
    ]
  },
  three_finger_salute: {
    name: "Three-Finger Salute",
    emoji: "",
    description: "A gesture where the index, middle, and ring fingers are extended while holding the thumb to the little finger.",
    countries: [
      {
        code: "CN",
        name: "China",
        flag: "🇨🇳",
        type: "neutral",
        meaning: "its used in protests that are pro democracy",
        detail: "In China, the three-finger salute has been associated with political protest movements advocating democratic ideals."
      },
      {
        code: "US",
        name: "United States of America",
        flag: "🇺🇸",
        type: "neutral",
        meaning: "boy scouts",
        detail: "In the United States, the three-finger salute is sometimes associated with scouting organizations such as the Boy Scouts."
      },
      {
        code: "CA",
        name: "Canada",
        flag: "🇨🇦",
        type: "neutral",
        meaning: "solidarity",
        detail: "In Canada, the three-finger salute may symbolize solidarity or unity depending on context."
      },
      {
        code: "TH",
        name: "Thailand",
        flag: "🇹🇭",
        type: "negative",
        meaning: "this is to shown their proud and respect to their country",
        detail: "In Thailand, the three-finger salute may symbolize pride, respect, or national identity depending on context."
      },
      {
        code: "PT",
        name: "Portugal",
        flag: "🇵🇹",
        type: "positive",
        meaning: "promessa de escuteiro",
        detail: "In Portugal, the three-finger salute may be associated with scouting traditions or promises."
      },
      {
        code: "GE",
        name: "Georgia",
        flag: "🇬🇪",
        type: "positive",
        meaning: "it is used as a salute in georgia    ",
        detail: "In Georgia, the three-finger salute may be used as a form of greeting or symbolic salute."
      }
    ]
  },
  thumbs_up: {
    name: "Thumbs up",
    emoji: "",
    description: "A gesture where the thumb is extended upward while the other fingers are curled into a fist.",
    countries: [
      {
        code: "AU",
        name: "Australia",
        flag: "🇦🇺",
        type: "positive",
        meaning: "all good, message received, approval.",
        detail: "In Australia, the thumbs up gesture is commonly used to indicate approval, agreement, or that everything is fine."
      },
      {
        code: "US",
        name: "United States of America",
        flag: "🇺🇸",
        type: "positive",
        meaning: "the person is in agreement",
        detail: "In the United States, the thumbs up gesture commonly indicates approval, agreement, or encouragement."
      },
      {
        code: "CA",
        name: "Canada",
        flag: "🇨🇦",
        type: "positive",
        meaning: "it means good",
        detail: "In Canada, the thumbs up gesture generally means something is good or approved."
      },
      {
        code: "AR",
        name: "Argentina",
        flag: "🇦🇷",
        type: "positive",
        meaning: "give an approval",
        detail: "In Argentina, the thumbs up gesture is commonly used to show approval or agreement."
      },
      {
        code: "IR",
        name: "Iran",
        flag: "🇮🇷",
        type: "negative",
        meaning: "it disrespects as it says to sit on it.",
        detail: "In Iran, the thumbs up gesture may be interpreted as an insulting or offensive gesture. "
      },
      {
        code: "AF",
        name: "Afghanistan",
        flag: "🇦🇫",
        type: "negative",
        meaning: "to insult and disrespect",
        detail: "In Afghanistan, the thumbs up gesture may be interpreted as an insult or sign of disrespect."
      },
      {
        code: "GR",
        name: "Greece",
        flag: "🇬🇷",
        type: "positive",
        meaning: "ok, cool, taxi",
        detail: "In Greece, the thumbs up gesture is commonly used to express approval or agreement."
      },
      {
        code: "IT",
        name: "Italy",
        flag: "🇮🇹",
        type: "positive",
        meaning: "ok, cool, taxi",
        detail: "In Italy, the thumbs up gesture is commonly used to indicate approval or agreement."
      },
      {
        code: "NG",
        name: "Nigeria",
        flag: "🇳🇬",
        type: "negative",
        meaning: "it means okay",
        detail: "In Nigeria, the thumbs up gesture is commonly used to indicate agreement or approval."
      },
      {
        code: "CI",
        name: "C?te d'Ivoire",
        flag: "🇨🇮",
        type: "negative",
        meaning: "as impolite and uncaring",
        detail: "In C?te d'Ivoire, the thumbs up gesture may sometimes be interpreted as impolite or uncaring depending on the context."
      },
      {
        code: "IQ",
        name: "Iraq",
        flag: "🇮🇶",
        type: "negative",
        meaning: "it means f... you....like a middle finger up in western countries ",
        detail: "In Iraq, the thumbs up gesture may be interpreted as an offensive signal similar to the middle finger in Western cultures."
      },
      {
        code: "BE",
        name: "Belgium",
        flag: "🇧🇪",
        type: "positive",
        meaning: "good",
        detail: "In Belgium, the thumbs up gesture is commonly used to express approval."
      }
    ]
  },
  v_sign: {
    name: "V sign",
    emoji: "",
    description: "A gesture where the index and middle fingers are raised to form a V shape, with palm either facing inward or outward.",
    countries: [
      {
        code: "AU",
        name: "Australia",
        flag: "🇦🇺",
        type: "negative",
        meaning: "as peace",
        detail: "In Australia, the V sign is commonly interpreted as a symbol of peace when shown with the palm facing outward."
      },
      {
        code: "NZ",
        name: "New Zealand",
        flag: "🇳🇿",
        type: "negative",
        meaning: "it means \"peace\"",
        detail: "In New Zealand, the V sign is widely understood as a gesture representing peace or goodwill."
      },
      {
        code: "US",
        name: "United States of America",
        flag: "🇺🇸",
        type: "positive",
        meaning: "peace",
        detail: "In the United States, the V sign is widely recognized as a gesture representing peace or goodwill."
      },
      {
        code: "CA",
        name: "Canada",
        flag: "🇨🇦",
        type: "positive",
        meaning: "peace and love",
        detail: "In Canada, the V sign is commonly interpreted as representing peace and love."
      },
      {
        code: "GB",
        name: "United Kingdom",
        flag: "🇬🇧",
        type: "negative",
        meaning: "offensive gesture off",
        detail: "In the United Kingdom, the V sign shown with the palm facing inward is widely understood as a rude or insulting gesture."
      },
      {
        code: "IE",
        name: "Ireland",
        flag: "🇮🇪",
        type: "negative",
        meaning: "peace or victory",
        detail: "In Ireland, the V sign is commonly interpreted as representing peace or victory."
      },
      {
        code: "ZA",
        name: "South Africa",
        flag: "🇿🇦",
        type: "positive",
        meaning: "peace.",
        detail: "In South Africa, the V sign is commonly interpreted as a gesture representing peace."
      },
      {
        code: "GI",
        name: "Gibraltar",
        flag: "🇬🇮",
        type: "positive",
        meaning: "peace",
        detail: "In Gibraltar, the V sign is commonly interpreted as representing peace."
      }
    ]
  }
};

