"""
assessment/template_library.py — Scenario Template Library & Variations.

Psychometrically validated Scenario Template Library for the Theory of Planned Behavior (TPB):
- Measures Attitude, Subjective Norm, Perceived Behavioral Control, Behavioral Intention.
- Contains 18 distinct scenario templates across 3 core categories:
    1. Social Media Interaction (public feeds, confession accounts, polls, viral reels, comments)
    2. Private Group Communication (WhatsApp batch chats, Telegram channels, Discord study servers)
    3. University & Campus Community (group project repositories, hostel living, student societies, LMS)
- Written in clear, simple, everyday English (grade 6-8 reading level) with authentic
  Pakistani / South Asian university cultural context.
"""

from typing import List, Dict, Any

STUDENT_NAMES_FEMALE = [
    "Zainab", "Fatima", "Arooj", "Mahnoor", "Laiba", "Hira", "Rida",
    "Khadija", "Maryam", "Sana", "Ayesha", "Nimra", "Anum", "Noor", "Alishba"
]

STUDENT_NAMES_MALE = [
    "Hamza", "Bilal", "Usman", "Danish", "Shahmeer", "Taimoor", "Saad",
    "Arham", "Faisal", "Arslan", "Waleed", "Noman", "Talha", "Haris", "Zubair"
]

ALL_STUDENT_NAMES = STUDENT_NAMES_FEMALE + STUDENT_NAMES_MALE

DEPARTMENT_ACADEMIC_TASKS = {
    "Computer Science": [
        "Programming Fundamentals",
        "Database Systems",
        "Web Development",
        "Data Structures",
        "Mobile App Development",
    ],
    "Software Engineering": [
        "Software Engineering",
        "Mobile App Development",
        "Web Application Development",
        "Software Architecture",
        "Agile Development",
    ],
    "Information Technology": [
        "Network Security",
        "Cloud Computing",
        "Web Systems",
        "Database Administration",
    ],
    "Engineering": [
        "Circuit Analysis",
        "Digital Logic Design",
        "Engineering Mechanics",
        "Microcontroller Systems",
    ],
    "Business": [
        "Business Marketing",
        "Financial Management",
        "Business Analytics",
        "Entrepreneurship",
    ],
    "Psychology": [
        "Social Psychology",
        "Cognitive Psychology",
        "Research Methods",
        "Behavioral Studies",
    ],
    "Medical / Health Sciences": [
        "Clinical Pharmacology",
        "Human Anatomy",
        "Pathology",
        "Community Health",
    ],
    "Medical Sciences": [
        "Clinical Pharmacology",
        "Human Anatomy",
        "Pathology",
        "Physiology",
    ],
    "Social Sciences": [
        "Sociology",
        "Public Policy",
        "Social Research",
        "International Relations",
    ],
    "Law": [
        "Constitutional Law",
        "Corporate Law",
        "Legal Drafting",
        "Criminal Law",
    ],
    "Education": [
        "Educational Psychology",
        "Curriculum Design",
        "Classroom Teaching",
        "Educational Technology",
    ],
    "Other": [
        "their semester coursework",
        "their group presentation",
        "their class assignment",
    ],
}

LIVING_SETTINGS = {
    "University hostel": [
        "in the university hostel wing late at night",
        "in the hostel dining mess between study hours",
        "outside the hostel study room",
    ],
    "Home with family": [
        "at their study desk at home while preparing for class",
        "while commuting home on the university point bus",
        "at home after a long day of lectures",
    ],
    "Shared apartment": [
        "in a shared student apartment living room",
        "with fellow student roommates after class",
    ],
    "Private accommodation": [
        "in their private student room near campus",
    ],
    "Other": [
        "on campus during evening study hours",
    ],
}


SCENARIO_TEMPLATES: List[Dict[str, Any]] = [
    # =========================================================================
    # CATEGORY 1: SOCIAL MEDIA INTERACTION (6 TEMPLATES)
    # =========================================================================
    {
        "template_key": "TEMPL_SM_CONFESSION",
        "category": "social_media",
        "difficulty_level": 1,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["Instagram", "Facebook", "TikTok", "Snapchat", "Twitter/X"],
        "departments": ["Any"],
        "livings": ["Any"],
        "context_tags": ["anonymous_confession", "candid_photo", "public_mockery", "campus_page"],
        "personalization_tags": {
            "media_type": "public_feed",
            "social_habits": ["Social interaction", "Public browsing"],
        },
        "narrative_variations": [
            (
                "An anonymous university confession page on {platform} posts a photo of {target_name} "
                "studying alone in the campus library, with a caption making fun of how stressed they look. "
                "Within an hour, the post gets dozens of laughing reactions and mean comments. Several classmates "
                "tag each other in the comments to join in the joke."
            ),
            (
                "A popular campus student page on {platform} posts a candid picture of {target_name} waiting for the university bus, "
                "with a sarcastic poll asking followers to rate their outfit. The comments quickly fill with rude jokes. "
                "Multiple students from your batch are liking and sharing the post to their friends."
            ),
            (
                "During a lunch break, someone secretly takes a picture of {target_name} eating in the cafeteria and submits it to a student "
                "meme page on {platform} with an insulting caption. The post starts getting shared in batch chats, with students leaving "
                "sarcastic comments and tagging {target_name}'s friends."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about taking photos of classmates without permission and posting them on confession pages?",
                "options": [
                    {"text": "It is just harmless fun; confession pages are a normal part of student life.", "score": 1},
                    {"text": "A little rude, but students should expect their pictures might be taken in public.", "score": 3},
                    {"text": "It is wrong and hurtful because mocking someone publicly causes real embarrassment.", "score": 5},
                    {"text": "It is completely unacceptable and a clear form of online bullying that hurts people.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "How do you think this post will affect {target_name}?",
                "options": [
                    {"text": "It won't affect them at all; people forget social media posts in one day.", "score": 1},
                    {"text": "They might feel slightly embarrassed, but they should learn to brush it off.", "score": 3},
                    {"text": "It will make them feel anxious, upset, and uncomfortable coming to campus.", "score": 5},
                    {"text": "It will cause serious emotional distress and make them feel unsafe among their peers.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would your close friends expect you to do regarding this post?",
                "options": [
                    {"text": "They would expect me to laugh and tag other friends in the comments.", "score": 1},
                    {"text": "They would expect me to just ignore it because it's none of our business.", "score": 3},
                    {"text": "They would expect me not to like, share, or encourage the post.", "score": 5},
                    {"text": "They would support me if I reported the post and asked the page admin to delete it.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can do something helpful in this situation?",
                "options": [
                    {"text": "Not confident at all — one student cannot do anything against a big campus page.", "score": 1},
                    {"text": "A bit unsure — I worry that speaking up might turn people against me.", "score": 3},
                    {"text": "Fairly confident — I can message {target_name} to support them and report the post on {platform}.", "score": 5},
                    {"text": "Very confident — I can report the post, ask friends to flag it, and stand by {target_name}.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you saw this post on {platform}?",
                "options": [
                    {"text": "Read the comments for entertainment and maybe share it with a friend.", "score": 1},
                    {"text": "Scroll past the post without saying or doing anything.", "score": 3},
                    {"text": "Report the post quietly and send a friendly private message to check on {target_name}.", "score": 5},
                    {"text": "Report the post, message the page admin to take it down, and offer direct support to {target_name}.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If you notice {target_name} looking quiet and sitting alone over the next few days, what will you do?",
                "options": [
                    {"text": "Ignore it — students need to handle their own personal issues.", "score": 1},
                    {"text": "Feel bad for them from a distance, but do nothing.", "score": 3},
                    {"text": "Sit with them or invite them to study together so they don't feel left out.", "score": 5},
                    {"text": "Check in on them warmly, let them know they have friends here, and help them if needed.", "score": 7},
                ],
            },
        ],
    },
    {
        "template_key": "TEMPL_SM_PRESENTATION_POLL",
        "category": "social_media",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["Instagram", "Snapchat", "TikTok", "Facebook"],
        "departments": ["Any"],
        "livings": ["Any"],
        "context_tags": ["public_poll", "passive_aggressive", "academic_shaming", "story_sharing"],
        "personalization_tags": {
            "media_type": "stories_and_polls",
            "social_habits": ["Social interaction", "Campus activities"],
        },
        "narrative_variations": [
            (
                "Right after a class presentation in {academic_task}, {initiator_name} posts a story poll on {platform} "
                "asking: 'Who had the most embarrassing presentation today?' Although they do not mention a name, "
                "the options clearly point to {target_name}. Dozens of classmates vote and share laughing reactions."
            ),
            (
                "Following grades being announced for {academic_task}, {initiator_name} uploads an interactive story poll on {platform} "
                "mocking someone who struggled during the viva questions. Everyone in the batch knows it refers to {target_name}. "
                "Classmates are screenshotting the poll and laughing about it in group chats."
            ),
            (
                "During a class seminar for {academic_task}, {initiator_name} records a short clip of {target_name} stumbling on their words "
                "and posts it on {platform} with a poll: 'Should they drop this course? Yes or Definitely.' "
                "The poll gets shared among students from other sections as well."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about posting polls online to make fun of a classmate's presentation?",
                "options": [
                    {"text": "It is just light teasing; presenting in class means you should be ready for criticism.", "score": 1},
                    {"text": "A bit unkind, but people post silly polls all the time without bad intentions.", "score": 3},
                    {"text": "It is mean and hurtful because it publicly shames someone who was trying their best.", "score": 5},
                    {"text": "It is completely unacceptable bullying that discourages students from speaking up in class.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would good classmates expect you to do when this story appears?",
                "options": [
                    {"text": "They would expect me to vote in the poll and laugh along.", "score": 1},
                    {"text": "They would expect me to just swipe past and stay out of it.", "score": 3},
                    {"text": "They would expect me not to vote or encourage the poll.", "score": 5},
                    {"text": "They would respect me for telling {initiator_name} that the poll is unfair and should be deleted.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can handle this situation in a helpful way?",
                "options": [
                    {"text": "Not confident — speaking up against popular students only causes problems for yourself.", "score": 1},
                    {"text": "Unsure — I would want to help, but I wouldn't know what words to say.", "score": 3},
                    {"text": "Fairly confident — I can privately tell {initiator_name} that the poll is hurtful.", "score": 5},
                    {"text": "Very confident — I can ask {initiator_name} to delete the poll and send encouragement to {target_name}.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you realistically do when you see this story on {platform}?",
                "options": [
                    {"text": "Vote in the poll to see what others chose.", "score": 1},
                    {"text": "Swipe past without voting or reacting.", "score": 3},
                    {"text": "Refuse to vote, and send {target_name} a nice message about their effort.", "score": 5},
                    {"text": "Ask {initiator_name} privately to take down the poll, and compliment {target_name}'s presentation.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "In future class presentations, how do you plan to support your classmates?",
                "options": [
                    {"text": "Just focus on my own presentation and ignore others.", "score": 1},
                    {"text": "Stay quiet unless the teacher asks for comments.", "score": 3},
                    {"text": "Make sure to clap and say something encouraging when nervous presenters finish.", "score": 5},
                    {"text": "Actively encourage nervous peers and make sure our group never tolerates making fun of mistakes.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe that making fun of mistakes in class stops students from participating in the future?",
                "options": [
                    {"text": "No — students should just be tough and not care what others think.", "score": 1},
                    {"text": "Maybe a little, but most students get over it quickly.", "score": 3},
                    {"text": "Yes — fear of being made fun of makes students scared to raise their hand or present.", "score": 5},
                    {"text": "Definitely — mockery destroys confidence and prevents students from learning properly.", "score": 7},
                ],
            },
        ],
    },
    {
        "template_key": "TEMPL_SM_CAMPUS_VIDEO",
        "category": "social_media",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["TikTok", "Instagram", "Snapchat", "Facebook"],
        "departments": ["Any"],
        "livings": ["Any"],
        "context_tags": ["video_recording", "unauthorised_filming", "viral_meme", "cafeteria_shaming"],
        "personalization_tags": {
            "media_type": "short_video",
            "social_habits": ["Content creation", "Social interaction"],
        },
        "narrative_variations": [
            (
                "In the campus cafeteria during lunch, {initiator_name} secretly films {target_name} tripping and spilling their tray. "
                "They add funny sound effects and text on {platform}: 'How not to walk in uni.' "
                "The video gets hundreds of views within a few hours, with strangers in the comments making fun of {target_name}."
            ),
            (
                "While sitting in the university lawn, {target_name} is recorded on video by {initiator_name} without knowing it. "
                "The clip is edited into a funny reel on {platform} mocking how {target_name} reads while pacing back and forth. "
                "The video is shared in batch WhatsApp groups with laughing emojis."
            ),
            (
                "During a campus event, {target_name} makes an awkward stumble that {initiator_name} catches on camera. "
                "Instead of keeping it private, {initiator_name} posts it on {platform} with slow-motion replays and laughing tags. "
                "Students across different departments re-share the video, leaving {target_name} deeply embarrassed."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about secretly filming classmates and posting the video online for laughs?",
                "options": [
                    {"text": "It is normal internet humor; if you are in public, anyone can film you.", "score": 1},
                    {"text": "A bit annoying, but viral videos happen every day and nobody means true harm.", "score": 3},
                    {"text": "It is wrong and disrespectful — filming someone without their consent to laugh at them crosses the line.", "score": 5},
                    {"text": "It is a serious violation of privacy that humiliates the person and makes campus feel unsafe.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do sensible students expect when a viral video makes fun of a classmate?",
                "options": [
                    {"text": "Most students forward it to friends because they find it funny.", "score": 1},
                    {"text": "Most students just watch it quietly without saying anything.", "score": 3},
                    {"text": "Sensible students refuse to like, comment, or share the video.", "score": 5},
                    {"text": "Good peers expect people to tell {initiator_name} that posting the video went too far and should be deleted.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident do you feel that you can help get an unfair video removed?",
                "options": [
                    {"text": "Not confident — once a video is online, regular students can't do anything about it.", "score": 1},
                    {"text": "A bit unsure — I know there is a report button, but I don't know if it works.", "score": 3},
                    {"text": "Fairly confident — I know how to report privacy violations and ask friends to report it too.", "score": 5},
                    {"text": "Very confident — I can report the video, support {target_name}, and ask {initiator_name} to take it down.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you saw this video appearing on your {platform} feed?",
                "options": [
                    {"text": "Watch it and maybe send it to a friend's private chat.", "score": 1},
                    {"text": "Ignore it and keep scrolling down my feed.", "score": 3},
                    {"text": "Report the video for bullying and avoid sharing it with anyone.", "score": 5},
                    {"text": "Report the video, message {initiator_name} to delete it, and check in on {target_name}.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "How do you plan to handle photos or videos of classmates on campus in the future?",
                "options": [
                    {"text": "Record whatever seems funny and post it on my private story.", "score": 1},
                    {"text": "Avoid posting, but keep funny videos of classmates saved on my phone.", "score": 3},
                    {"text": "Never record or share photos/videos of any student without asking them first.", "score": 5},
                    {"text": "Always respect people's privacy and speak up if someone tries to film a classmate without consent.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe that filming someone without their knowledge hurts their trust in fellow students?",
                "options": [
                    {"text": "No — everyone knows cameras are everywhere nowadays.", "score": 1},
                    {"text": "Only for a little while, until another funny video comes along.", "score": 3},
                    {"text": "Yes — it makes people anxious and constantly worried that they are being recorded.", "score": 5},
                    {"text": "Completely — it breaks trust on campus and makes students feel guarded and uncomfortable.", "score": 7},
                ],
            },
        ],
    },
    {
        "template_key": "TEMPL_SM_LINKEDIN_DOGPILE",
        "category": "social_media",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["LinkedIn", "Twitter/X", "Instagram", "Facebook"],
        "departments": ["Computer Science", "Software Engineering", "Business", "Engineering", "Any"],
        "livings": ["Any"],
        "context_tags": ["professional_network", "sarcastic_comments", "achievement_shaming", "internship"],
        "personalization_tags": {
            "media_type": "professional_feed",
            "social_habits": ["Academic communication", "Professional networking"],
        },
        "narrative_variations": [
            (
                "When {target_name} shares an excited post on {platform} about getting an internship related to {academic_task}, "
                "{initiator_name} and several classmates leave sarcastic comments claiming they only got it through favoritism. "
                "Their rude comments get laughing likes, overshadowing the post and humiliating {target_name}."
            ),
            (
                "After {target_name} posts a project update on {platform} about their hard work in {academic_task}, "
                "a group of classmates coordinate in a private chat to leave sarcastic critiques under the post. "
                "Their comments make {target_name}'s work look bad in front of alumni and potential employers."
            ),
            (
                "On a public student showcase post on {platform}, {target_name} shares their semester achievement. "
                "{initiator_name} quotes the post with sarcastic remarks, calling the work basic and questioning {target_name}'s ability. "
                "Mutual classmates join in by reposting the quote with laughing remarks."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about leaving sarcastic or mocking comments on a classmate's achievements on {platform}?",
                "options": [
                    {"text": "It is fair — posting online means people can give you reality checks.", "score": 1},
                    {"text": "A bit petty, but students are naturally competitive about jobs and internships.", "score": 3},
                    {"text": "It is mean and unprofessional — tearing down a classmate's milestone crosses a clear line.", "score": 5},
                    {"text": "It is completely wrong and toxic behavior meant to hurt a peer's confidence and career.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would respected teachers and mature peers expect when a student posts about an achievement?",
                "options": [
                    {"text": "They expect people to compete hard and humble anyone who shows off.", "score": 1},
                    {"text": "They expect students to just mind their own business and stay out of it.", "score": 3},
                    {"text": "They expect polite congratulations, encouragement, or respectful silence.", "score": 5},
                    {"text": "They expect students to genuinely support and celebrate each other's successes.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that leaving a positive comment can help counter mean comments on {platform}?",
                "options": [
                    {"text": "Not confident — once people start making fun of someone, a positive comment looks silly.", "score": 1},
                    {"text": "A bit doubtful — one nice comment usually gets drowned out.", "score": 3},
                    {"text": "Fairly confident — leaving a supportive comment shows {target_name} that not everyone is mean.", "score": 5},
                    {"text": "Very confident — positive comments encourage other quiet classmates to speak up and show support.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you saw classmates leaving mean comments on {target_name}'s post?",
                "options": [
                    {"text": "Read the drama and smile without commenting.", "score": 1},
                    {"text": "Feel bad for {target_name}, but avoid commenting to stay out of trouble.", "score": 3},
                    {"text": "Post a genuine message saying 'Congratulations!' and message {target_name} privately.", "score": 5},
                    {"text": "Leave a supportive public comment praising their hard work and privately tell {initiator_name} to stop.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If a classmate is scared to share their project work because they fear being mocked, what will you tell them?",
                "options": [
                    {"text": "Agree with them that keeping quiet is the safest choice.", "score": 1},
                    {"text": "Tell them it's their choice and leave it at that.", "score": 3},
                    {"text": "Encourage them privately and tell them their work is valuable.", "score": 5},
                    {"text": "Remind them to be proud of their effort, offer to review their work, and cheer them on.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe healthy competition among students ever excuses making fun of someone's achievements?",
                "options": [
                    {"text": "Yes — the job market is tough, so people need to grow thick skin.", "score": 1},
                    {"text": "Sometimes — if someone boasts too much, they should expect some pushback.", "score": 3},
                    {"text": "No — healthy competition means working hard on yourself, not putting others down.", "score": 5},
                    {"text": "Never — making fun of a peer's success comes from jealousy and hurts the whole class atmosphere.", "score": 7},
                ],
            },
        ],
    },
    {
        "template_key": "TEMPL_SM_CANDID_MEME",
        "category": "social_media",
        "difficulty_level": 1,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["Instagram", "Facebook", "Twitter/X", "WhatsApp"],
        "departments": ["Any"],
        "livings": ["Any"],
        "context_tags": ["lecture_hall", "candid_photo", "viral_meme", "class_group"],
        "personalization_tags": {
            "media_type": "meme_format",
            "social_habits": ["Meme sharing", "Social interaction"],
        },
        "narrative_variations": [
            (
                "During a tough lecture on {academic_task}, someone snaps a photo of {target_name} looking stressed and confused. "
                "By evening, the photo is turned into a meme sticker captioned: 'When you have zero brain cells.' "
                "The meme is sent into batch WhatsApp groups, where students share it with laughing stickers."
            ),
            (
                "A candid picture of {target_name} yawning during an early morning class is edited into a meme on {platform}. "
                "The meme labels {target_name} as the 'class sleeper' and spreads among seniors and juniors who don't even know {target_name}. "
                "People start calling {target_name} by that nickname in the hallways."
            ),
            (
                "A picture of {target_name} dropping their notes in the campus corridor is turned into a meme strip on {platform}. "
                "The post makes fun of their clumsiness and gets dozens of shares in student group chats."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about turning candid pictures of classmates into meme stickers without asking?",
                "options": [
                    {"text": "It is completely fine — memes are just student humor and nobody means any harm.", "score": 1},
                    {"text": "A bit annoying for the person, but it usually blows over in a few days.", "score": 3},
                    {"text": "It is wrong — making fun of a classmate's picture without their permission is hurtful.", "score": 5},
                    {"text": "It is completely unacceptable and disrespectful to turn a peer into a joke for cheap laughs.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would your circle of friends expect you to do when this meme appears in a chat?",
                "options": [
                    {"text": "Forward it with laughing emojis and tag other classmates.", "score": 1},
                    {"text": "Look at it without forwarding or commenting.", "score": 3},
                    {"text": "Refuse to share it and tell friends not to forward it.", "score": 5},
                    {"text": "Say clearly in the chat that making stickers out of classmates is not cool.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that speaking up against a meme can stop people from sharing it?",
                "options": [
                    {"text": "Not confident — once people find something funny, nobody listens if you complain.", "score": 1},
                    {"text": "Unsure — I might be called someone who can't take a joke.", "score": 3},
                    {"text": "Fairly confident — reminding friends that it hurts their feelings usually makes them stop.", "score": 5},
                    {"text": "Very confident — speaking up calmly reminds people of common decency and stops the trend.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do when this meme appears on {platform} or in WhatsApp?",
                "options": [
                    {"text": "Save the sticker to use in chats with other friends.", "score": 1},
                    {"text": "Look at the meme and ignore the conversation.", "score": 3},
                    {"text": "Don't share it, and send a private message to check on {target_name}.", "score": 5},
                    {"text": "Ask the person who made it to delete it, and let {target_name} know you support them.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If someone in your study circle wants to make a meme out of another student's photo, what will you say?",
                "options": [
                    {"text": "Help them come up with funny captions for it.", "score": 1},
                    {"text": "Stay quiet and let them do what they want.", "score": 3},
                    {"text": "Tell them privately that making memes of classmates is hurtful.", "score": 5},
                    {"text": "Tell them clearly not to do it because we shouldn't make fun of our own batch mates.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe that 'it was just a joke' makes it okay to hurt someone's feelings?",
                "options": [
                    {"text": "Yes — if nobody intended harm, the person shouldn't complain.", "score": 1},
                    {"text": "Mostly yes — people are sometimes too sensitive about jokes.", "score": 3},
                    {"text": "No — calling it a joke doesn't take away the embarrassment and hurt it causes.", "score": 5},
                    {"text": "Never — hiding behind 'it's just a joke' is an excuse that normalizes online teasing.", "score": 7},
                ],
            },
        ],
    },
    {
        "template_key": "TEMPL_SM_PARODY_ACCOUNT",
        "category": "social_media",
        "difficulty_level": 3,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["Instagram", "Twitter/X", "TikTok", "Facebook"],
        "departments": ["Any"],
        "livings": ["Any"],
        "context_tags": ["impersonation", "fake_profile", "reputation_slander", "identity_theft"],
        "personalization_tags": {
            "media_type": "profile_impersonation",
            "social_habits": ["Social interaction", "Public browsing"],
        },
        "narrative_variations": [
            (
                "Someone creates a fake account on {platform} using {target_name}'s name and photo. "
                "The account posts rude opinions, fake confessions, and messages pretending to be {target_name}, "
                "confusing classmates and teachers who think the account is real."
            ),
            (
                "A fake profile pretending to be {target_name} appears on {platform}, sending strange and annoying DMs to other students. "
                "Classmates start screenshotting the messages and talking behind {target_name}'s back, "
                "while {target_name} has no idea someone is impersonating them."
            ),
            (
                "Someone sets up a spoof account on {platform} targeting {target_name}, regularly posting fabricated quotes criticizing professors "
                "and making fun of group project teammates in {academic_task}. Classmates start following the account and sharing its stories."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about making a fake account or parody profile of a student?",
                "options": [
                    {"text": "It is just funny campus drama; it's fun to watch.", "score": 1},
                    {"text": "Not very polite, but fake profiles happen on social media all the time.", "score": 3},
                    {"text": "It is completely wrong — making a fake profile can ruin someone's reputation.", "score": 5},
                    {"text": "It is an unacceptable and dangerous act of harassment that can cause severe harm to a student.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would good peers and teachers expect when a fake student account is discovered?",
                "options": [
                    {"text": "Most students follow the account to see what crazy thing it posts next.", "score": 1},
                    {"text": "People just watch silently until someone in authority notices.", "score": 3},
                    {"text": "Responsible students report the account immediately for impersonation.", "score": 5},
                    {"text": "Good peers alert {target_name} right away and collectively report the fake profile to get it banned.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can help {target_name} get a fake account removed on {platform}?",
                "options": [
                    {"text": "Not confident — social media platforms never respond to student reports.", "score": 1},
                    {"text": "A bit unsure — I wouldn't know the exact reporting steps.", "score": 3},
                    {"text": "Fairly confident — I can guide {target_name} on how to report impersonation with their student ID.", "score": 5},
                    {"text": "Very confident — I can report it, help {target_name} report it, and ask our batch to flag it too.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "If classmates mistakenly think the fake account is real, how confident are you that you can clear things up?",
                "options": [
                    {"text": "Not confident — once rumors start, people believe whatever they want.", "score": 1},
                    {"text": "A bit hesitant — explaining things might drag me into unwanted drama.", "score": 3},
                    {"text": "Fairly confident — I can tell our batch group that the account is fake.", "score": 5},
                    {"text": "Very confident — I can post an alert in our class groups to make sure everyone knows it's an imposter.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you do the moment you find this fake account on {platform}?",
                "options": [
                    {"text": "Follow the account and read its posts out of curiosity.", "score": 1},
                    {"text": "Do nothing and see how long it stays online.", "score": 3},
                    {"text": "Tell {target_name} right away so they know about it.", "score": 5},
                    {"text": "Alert {target_name}, report the account for impersonation, and tell friends not to follow it.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If the person who made the fake account is in your friend group, what will you tell them?",
                "options": [
                    {"text": "Laugh with them about how funny the fake posts are.", "score": 1},
                    {"text": "Stay quiet so I don't ruin my friendship with them.", "score": 3},
                    {"text": "Tell them privately that making fake profiles is dangerous and wrong.", "score": 5},
                    {"text": "Tell them firmly to delete the account and apologize to {target_name}, or I will report it.", "score": 7},
                ],
            },
        ],
    },

    # =========================================================================
    # CATEGORY 2: PRIVATE GROUP COMMUNICATION (6 TEMPLATES)
    # =========================================================================
    {
        "template_key": "TEMPL_PG_BATCH_MOCKERY",
        "category": "private_group",
        "difficulty_level": 1,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Telegram", "Discord"],
        "departments": ["Computer Science", "Software Engineering", "Information Technology", "Engineering", "Any"],
        "livings": ["Any"],
        "context_tags": ["batch_group", "academic_query", "mocking_stickers", "voice_notes", "silence_of_majority"],
        "personalization_tags": {
            "media_type": "group_messaging",
            "social_habits": ["Group chats", "Academic communication"],
        },
        "narrative_variations": [
            (
                "In your departmental batch {platform} group of over 100 students, {target_name} asks a polite question "
                "about the assignment deadline for {academic_task}. Right away, {initiator_name} and two friends "
                "reply with sarcastic voice notes and mocking stickers calling {target_name} clueless and lazy. "
                "Most students remain silent, while a few react with laughing emojis. {target_name} leaves the group in embarrassment."
            ),
            (
                "During exam preparation in the course {platform} group, {target_name} asks about a lecture topic from {academic_task}. "
                "{initiator_name} replies publicly with rude remarks: 'Did you sleep through the entire semester?' "
                "They spam the chat with laughing stickers, turning {target_name}'s honest question into a joke. "
                "No one in the chat answers the actual question."
            ),
            (
                "In the class section {platform} group, {target_name} shares their study notes for {academic_task} to help others. "
                "{initiator_name} spots a small typo in a screenshot and ridicules {target_name}'s intelligence in front of the whole class. "
                "A few vocal students join in with sarcastic comments, while eighty other members read without saying anything."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about making fun of a classmate who asks for academic help in a batch WhatsApp group?",
                "options": [
                    {"text": "It is normal banter; students should check lecture slides before asking silly questions.", "score": 1},
                    {"text": "A bit harsh, but people in big groups need to develop thick skin.", "score": 3},
                    {"text": "It is mean and unfair — it makes students scared to ask questions and seek help.", "score": 5},
                    {"text": "It is completely wrong — batch groups should be helpful, not places where students get ridiculed.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would most reasonable classmates think if you stepped in to answer {target_name}'s question?",
                "options": [
                    {"text": "They would think I am ruining the fun and being overly serious.", "score": 1},
                    {"text": "They wouldn't care either way — group chats move fast.", "score": 3},
                    {"text": "They would quietly appreciate someone being helpful in the chat.", "score": 5},
                    {"text": "They would respect me for breaking the silence and setting a polite tone in our batch group.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can change the mood in the group when people start teasing someone?",
                "options": [
                    {"text": "Not confident — speaking up usually makes the bullies start targeting you next.", "score": 1},
                    {"text": "A bit hesitant — I want to help, but I worry about sounding awkward in a big group.", "score": 3},
                    {"text": "Fairly confident — I can simply reply with the correct answer to shift focus away from the teasing.", "score": 5},
                    {"text": "Very confident — I can answer the question politely and remind everyone to keep the chat respectful.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do right after seeing this teasing in {platform}?",
                "options": [
                    {"text": "Add a laughing sticker or reaction to go with the flow.", "score": 1},
                    {"text": "Mute the group and ignore the messages.", "score": 3},
                    {"text": "Message {target_name} privately with the answer and tell them not to feel bad.", "score": 5},
                    {"text": "Reply in the group with the helpful answer, and say that making fun of questions is uncalled for.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If {target_name} left the group because they felt embarrassed, how would you respond?",
                "options": [
                    {"text": "Assume someone else will add them back if they really need updates.", "score": 1},
                    {"text": "Feel bad, but take no personal step to reach out.", "score": 3},
                    {"text": "Message them privately to share class notes and tell them what happened was unfair.", "score": 5},
                    {"text": "Contact the class CR or admin to add them back, and make sure they feel welcomed in the class.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe class WhatsApp groups should have clear rules against insulting classmates?",
                "options": [
                    {"text": "No — group chats are informal and shouldn't have strict rules.", "score": 1},
                    {"text": "Only if people use bad words, otherwise teasing is fine.", "score": 3},
                    {"text": "Yes — basic respect is important so all students can stay updated without fear.", "score": 5},
                    {"text": "Definitely — class groups should be safe study spaces where nobody gets bullied.", "score": 7},
                ],
            },
        ],
    },
    {
        "template_key": "TEMPL_PG_LEAKED_CHAT",
        "category": "private_group",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Telegram", "Discord", "Snapchat"],
        "departments": ["Any"],
        "livings": ["University hostel", "Shared apartment", "Home with family"],
        "context_tags": ["breach_of_privacy", "leaked_screenshot", "exam_stress", "meme_circulation"],
        "personalization_tags": {
            "media_type": "private_screenshot",
            "social_habits": ["Group chats", "Private conversations"],
        },
        "narrative_variations": [
            (
                "A screenshot of a private conversation between {target_name} and a friend — where {target_name} "
                "confided feeling overwhelmed by {academic_task} and thinking of dropping the course — is leaked into an unofficial {platform} group. "
                "{initiator_name} captions it: 'Look at this emotional drama.' The screenshot gets forwarded into multiple chats, "
                "while {target_name} has no idea their private confession is being laughed at."
            ),
            (
                "During exam week, a private voice note from {target_name} talking about severe exam stress and exhaustion is forwarded "
                "into an open campus {platform} channel by {initiator_name}. Students begin making jokes about it. "
                "The audio spreads while {target_name} is quietly studying in the library."
            ),
            (
                "In a small project group, {target_name} privately explains that a family emergency caused a short delay in {academic_task}. "
                "One teammate screenshots the private message and forwards it to a 60-member batch {platform} group, "
                "claiming {target_name} is just making excuses to avoid work."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about leaking someone's private emotional messages into a group chat?",
                "options": [
                    {"text": "People shouldn't write sensitive things digitally if they don't want them shared.", "score": 1},
                    {"text": "A breach of trust, but leaks in group chats are just part of university life.", "score": 3},
                    {"text": "It is completely wrong — sharing someone's personal struggles breaks trust and causes deep hurt.", "score": 5},
                    {"text": "It is a severe violation of privacy that is cruel and can deeply harm a person's mental health.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would your closest peers expect you to do when a leaked screenshot is shared in a chat?",
                "options": [
                    {"text": "They would expect me to forward it to other friends for gossip.", "score": 1},
                    {"text": "They would expect me to stay quiet and read without getting involved.", "score": 3},
                    {"text": "They would expect me not to forward it and to delete the image.", "score": 5},
                    {"text": "They would expect me to tell the person who sent it that leaking private chats is wrong and must stop.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can help stop a leaked private message from spreading further?",
                "options": [
                    {"text": "Not confident — once something is forwarded on WhatsApp, you cannot stop it.", "score": 1},
                    {"text": "Doubtful — asking people to delete things often makes them more curious.", "score": 3},
                    {"text": "Fairly confident — I can tell friends in my chats to delete the screenshot and stop sharing it.", "score": 5},
                    {"text": "Very confident — I can tell the sender it's wrong, alert {target_name}, and ask group admins to delete the message.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you received this leaked screenshot in a group chat?",
                "options": [
                    {"text": "Forward it to my close friends to discuss the gossip.", "score": 1},
                    {"text": "Look at the screenshot and close the chat without doing anything.", "score": 3},
                    {"text": "Do not forward it, delete it, and privately let {target_name} know about the leak.", "score": 5},
                    {"text": "Say in the chat that sharing private messages is wrong, and message {target_name} to offer support.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If a close friend of yours is forwarding the screenshot, what will you tell them?",
                "options": [
                    {"text": "Ask them if there is any more news or gossip about it.", "score": 1},
                    {"text": "Say nothing so I don't create awkwardness between us.", "score": 3},
                    {"text": "Ask them quietly to delete it because it isn't right to spread someone's personal struggles.", "score": 5},
                    {"text": "Tell them firmly that leaking private chats is hurtful and urge them to delete it everywhere.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe that respecting privacy in student chats is a basic rule everyone should follow?",
                "options": [
                    {"text": "No — group chats are casual and nobody should expect true privacy.", "score": 1},
                    {"text": "Only in formal groups, but in casual chats people share whatever they want.", "score": 3},
                    {"text": "Yes — basic decency means you never share someone's private words without asking.", "score": 5},
                    {"text": "Definitely — keeping personal conversations private is essential for trust among students.", "score": 7},
                ],
            },
        ],
    },
    {
        "template_key": "TEMPL_PG_DISCORD_EXCLUSION",
        "category": "private_group",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["Discord", "WhatsApp", "Telegram"],
        "departments": ["Computer Science", "Software Engineering", "Engineering", "Information Technology", "Any"],
        "livings": ["Any"],
        "context_tags": ["discord_server", "voice_channel_muting", "exclusion", "gang_up_mockery"],
        "personalization_tags": {
            "media_type": "discord_channels",
            "social_habits": ["Gaming communities", "Study servers"],
        },
        "narrative_variations": [
            (
                "In a departmental {platform} study server for {academic_task}, {target_name} joins a voice channel "
                "to collaborate on an upcoming assignment. {initiator_name} and two moderators repeatedly server-mute {target_name}, "
                "mock their voice in the text chat, and kick them from the call. "
                "Other students in the channel stay quiet so they don't get kicked out themselves."
            ),
            (
                "During an online study session for {academic_task} on {platform}, {target_name} suggests an answer to a problem. "
                "{initiator_name} immediately mutes {target_name}, moves them to an empty AFK channel, and starts posting "
                "sarcastic jokes about them in the general chat. When {target_name} asks why, moderators ignore them."
            ),
            (
                "In a student study community on {platform}, {initiator_name} and friends decide to target {target_name}. "
                "Every time {target_name} posts a question or study notes for {academic_task}, members react with negative stickers and "
                "post sarcastic remarks until {target_name} stops logging on completely."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about using server moderator powers to mute and tease a classmate?",
                "options": [
                    {"text": "Server owners can do whatever they want; it is not a big deal.", "score": 1},
                    {"text": "A bit childish, but Discord and gaming servers always have some toxic banter.", "score": 3},
                    {"text": "It is unfair and mean — using admin tools to silence a classmate is online bullying.", "score": 5},
                    {"text": "It is completely unacceptable abuse of power that unfairly excludes a student from studying.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would fair classmates in the server expect from others when someone is being bullied like this?",
                "options": [
                    {"text": "They expect people to laugh along so they don't get kicked out too.", "score": 1},
                    {"text": "They expect people to leave the voice call quietly and mind their business.", "score": 3},
                    {"text": "They would respect anyone who un-mutes {target_name} or speaks up against the unfairness.", "score": 5},
                    {"text": "They expect responsible members to tell the moderators that treating classmates like this is wrong.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can speak up when server moderators are the ones teasing someone?",
                "options": [
                    {"text": "Not confident — arguing with moderators means you will get banned or kicked out next.", "score": 1},
                    {"text": "Unsure — I would feel powerless against people who have admin permissions.", "score": 3},
                    {"text": "Fairly confident — I can leave the channel with {target_name} and study together in a separate call.", "score": 5},
                    {"text": "Very confident — I can object in chat, support {target_name}, and create an open study space for everyone.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you were in the call when {target_name} was muted and teased?",
                "options": [
                    {"text": "Laugh along in chat and stay in the call to fit in with the group.", "score": 1},
                    {"text": "Stay silent and wait until the argument ends.", "score": 3},
                    {"text": "Leave the call, message {target_name} privately, and offer to study together separately.", "score": 5},
                    {"text": "Speak up in the call to tell the moderators to stop, and make sure {target_name} is included.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If this server is the main place where study materials for {academic_task} are shared, how will you help {target_name}?",
                "options": [
                    {"text": "Assume they can find study resources on their own.", "score": 1},
                    {"text": "Feel bad, but avoid sharing materials to stay on good terms with the server mods.", "score": 3},
                    {"text": "Privately forward all important notes, assignments, and announcements to {target_name}.", "score": 5},
                    {"text": "Share all study files with {target_name} and ask the class CR to ensure all study links are shared publicly.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you think study groups and servers should be welcoming and open to all classmates?",
                "options": [
                    {"text": "No — student groups are private and owners can exclude whoever they don't like.", "score": 1},
                    {"text": "Only if teachers are watching, otherwise anything goes.", "score": 3},
                    {"text": "Yes — when students study together online, everyone deserves respect and equal access.", "score": 5},
                    {"text": "Definitely — isolating a student from academic study groups is unfair and harms their education.", "score": 7},
                ],
            },
        ],
    },
    {
        "template_key": "TEMPL_PG_BACKCHANNEL_GOSSIP",
        "category": "private_group",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Telegram", "Instagram"],
        "departments": ["Any"],
        "livings": ["Any"],
        "context_tags": ["backchannel_group", "gossip", "deliberate_exclusion", "reputation_damage"],
        "personalization_tags": {
            "media_type": "side_group",
            "social_habits": ["Group chats", "Social interaction"],
        },
        "narrative_variations": [
            (
                "A secret side group on {platform} is created by {initiator_name} excluding only {target_name} from the project team. "
                "In this side chat, members mock {target_name}'s contributions for {academic_task} and make up rumors about them. "
                "In the official group, members give {target_name} cold, one-word replies and ignore their ideas."
            ),
            (
                "Following a disagreement in class, {initiator_name} forms an exclusive {platform} group inviting fifteen classmates from the batch. "
                "The chat is used to criticize and laugh at everything {target_name} says or submits in {academic_task}. "
                "Members screenshot {target_name}'s social posts to mock them daily in this private chat."
            ),
            (
                "During preparation for {academic_task}, a study circle creates a clone {platform} chat that deliberately leaves out {target_name}. "
                "Members agree not to share important exam hints or lecture notes with {target_name}, while talking behind their back."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about making secret side groups to talk behind a classmate's back and exclude them?",
                "options": [
                    {"text": "People have the right to talk with whoever they want; venting about classmates is completely normal.", "score": 1},
                    {"text": "A little mean, but private gossip doesn't hurt anyone as long as the person doesn't find out.", "score": 3},
                    {"text": "It is toxic and unfair — creating secret groups to exclude someone ruins trust in the class.", "score": 5},
                    {"text": "It is completely wrong and cowardly bullying that isolates a person and damages class unity.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would honest classmates expect you to do if you were added to such a gossip chat?",
                "options": [
                    {"text": "They would expect me to stay in the group and enjoy the gossip.", "score": 1},
                    {"text": "They would expect me to stay quietly without saying anything.", "score": 3},
                    {"text": "They would expect me to leave the group and say that I don't want to be part of gossiping.", "score": 5},
                    {"text": "They would expect me to say gossiping is wrong, exit the group, and make sure {target_name} isn't being sabotaged.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can leave a gossip group even if it might make you unpopular?",
                "options": [
                    {"text": "Not confident — leaving might make them turn around and start gossiping about me next.", "score": 1},
                    {"text": "Unsure — I would worry about missing out on class updates and friend circles.", "score": 3},
                    {"text": "Fairly confident — I care more about doing the right thing than being in a mean chat.", "score": 5},
                    {"text": "Very confident — I can leave without hesitation, explain my reason politely, and encourage others to leave too.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you were added to a secret chat created just to make fun of {target_name}?",
                "options": [
                    {"text": "Stay in the group to see what everyone is saying and stay in the loop.", "score": 1},
                    {"text": "Mute the notifications and stay in the group quietly.", "score": 3},
                    {"text": "Leave the group and make sure I treat {target_name} with kindness in person.", "score": 5},
                    {"text": "Say that talking behind someone's back is wrong, exit the group, and check in on {target_name}.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If you see members from the secret group giving {target_name} the cold shoulder in class, what will you do?",
                "options": [
                    {"text": "Join in ignoring {target_name} so I don't stand out from the group.", "score": 1},
                    {"text": "Keep to myself and stay out of the social drama.", "score": 3},
                    {"text": "Sit next to {target_name} and talk with them so they don't feel left out.", "score": 5},
                    {"text": "Make sure {target_name} is included in discussions, and tell group members to stop acting childish.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe that 'what someone doesn't know can't hurt them' applies to secret bullying groups?",
                "options": [
                    {"text": "Yes — if {target_name} never sees the chat, no real harm is done.", "score": 1},
                    {"text": "Mostly yes, though it can create some awkwardness in class.", "score": 3},
                    {"text": "No — secret gossip always leaks into how people treat each other in real life.", "score": 5},
                    {"text": "Definitely not — talking behind someone's back leads to real exclusion and deeply hurts people.", "score": 7},
                ],
            },
        ],
    },
    {
        "template_key": "TEMPL_PG_VOICE_NOTE_MOCKERY",
        "category": "private_group",
        "difficulty_level": 1,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Telegram"],
        "departments": ["Any"],
        "livings": ["Any"],
        "context_tags": ["voice_note", "accent_mockery", "pronunciation", "forwarded_media"],
        "personalization_tags": {
            "media_type": "voice_recordings",
            "social_habits": ["Group chats", "Audio messages"],
        },
        "narrative_variations": [
            (
                "In a student discussion group for {academic_task}, {target_name} sends a voice note explaining their idea. "
                "Because of their regional accent, they pronounce a technical term slightly differently. "
                "{initiator_name} immediately cuts a snippet of the audio and sends it into other batch chats, "
                "imitating {target_name}'s accent with laughing voice notes and jokes."
            ),
            (
                "While discussing a difficult assignment in {academic_task}, {target_name} sends an audio note sounding nervous and stressed. "
                "{initiator_name} forwards the voice note across campus groups with the caption: 'Listen to this drama lol.' "
                "Students who have never met {target_name} start forwarding the voice note and making fun of their voice."
            ),
            (
                "During preparation for a group presentation in {academic_task}, {target_name} sends a practice voice clip. "
                "{initiator_name} turns the clip into a meme audio and shares it to a 100-member batch group with mocking commentary "
                "about their communication skills. After this, {target_name} stops speaking in group calls."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about forwarding someone's voice note to make fun of their accent or pronunciation?",
                "options": [
                    {"text": "It is just casual humor; people tease accents in university all the time.", "score": 1},
                    {"text": "A little insensitive, but students shouldn't take accent jokes too seriously.", "score": 3},
                    {"text": "It is mean and hurtful — making fun of someone's accent or background makes them feel insecure.", "score": 5},
                    {"text": "It is completely unacceptable bullying that silences students and makes them afraid to speak up.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do educated and respectful university students think of making fun of regional accents?",
                "options": [
                    {"text": "They laugh along because accent jokes are common among students.", "score": 1},
                    {"text": "They ignore it as harmless campus banter.", "score": 3},
                    {"text": "They view it as immature and disrespectful toward fellow classmates.", "score": 5},
                    {"text": "They strongly condemn it and believe every student's background should be respected.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can defend someone whose voice note is being mocked?",
                "options": [
                    {"text": "Not confident — calling out accent teasing makes people say you have no sense of humor.", "score": 1},
                    {"text": "Unsure — I wouldn't know how to address it without starting an argument.", "score": 3},
                    {"text": "Fairly confident — I can remind the group that accents are natural and the idea itself was good.", "score": 5},
                    {"text": "Very confident — I can clearly tell the group that mocking accents is wrong and support {target_name}.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do upon seeing {target_name}'s voice note forwarded and teased?",
                "options": [
                    {"text": "Listen to it and smile at the funny imitation voice notes.", "score": 1},
                    {"text": "Listen to it but stay quiet to stay out of the issue.", "score": 3},
                    {"text": "Send a message in the chat saying {target_name}'s point was good and we should focus on the work.", "score": 5},
                    {"text": "Tell {initiator_name} that mocking accents is wrong, and message {target_name} to reassure them.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "How will you encourage classmates who feel shy about speaking in group chats in the future?",
                "options": [
                    {"text": "Tell them to type messages instead of sending voice notes so they avoid teasing.", "score": 1},
                    {"text": "Don't think about it — students need to get over their own shyness.", "score": 3},
                    {"text": "Listen carefully, reply positively to their ideas, and appreciate their contributions.", "score": 5},
                    {"text": "Make sure our study groups have a welcoming environment where everyone feels safe to speak.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe that making fun of how a student speaks stops them from participating in class?",
                "options": [
                    {"text": "No — if someone studies hard, teasing has no impact on their learning.", "score": 1},
                    {"text": "Only a little bit, if the student is unusually shy.", "score": 3},
                    {"text": "Yes — fear of being laughed at makes students stop asking questions and stay silent.", "score": 5},
                    {"text": "Definitely — mocking how someone speaks shatters their confidence and damages their education.", "score": 7},
                ],
            },
        ],
    },
    {
        "template_key": "TEMPL_PG_TAGGING_HARASSMENT",
        "category": "private_group",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Discord", "Telegram"],
        "departments": ["Any"],
        "livings": ["Any"],
        "context_tags": ["spam_tagging", "public_humiliation", "deadline_stress", "gang_up"],
        "personalization_tags": {
            "media_type": "mention_spam",
            "social_habits": ["Group chats", "Collaborative projects"],
        },
        "narrative_variations": [
            (
                "When a small group task for {academic_task} is delayed by a couple of hours, {initiator_name} repeatedly tags @{target_name} "
                "in a 70-member batch group, sending dozens of rapid messages: '@{target_name} where is your work? @{target_name} useless as always.' "
                "Other students join in by tagging {target_name} with sarcastic countdown timers and laughing stickers, "
                "flooding {target_name}'s phone with notifications late into the night."
            ),
            (
                "In a departmental project channel, {initiator_name} publicly tags {target_name} again and again in the general chat, "
                "posting rude demands and insults about their commitment to {academic_task}. "
                "When {target_name} explains they had a family emergency, {initiator_name} replies: '@{target_name} always has excuses.' "
                "The entire class watches this public callout unfold."
            ),
            (
                "Following grades being posted in {academic_task}, {initiator_name} spam-tags {target_name} in the batch {platform} group, "
                "asking why their marks were low and posting laughing emojis with repeated @-mentions. "
                "The spam continues for over an hour while {target_name} turns their phone off in distress."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about spam-tagging and publicly calling out a classmate in a large group chat?",
                "options": [
                    {"text": "It is necessary — if someone is late or makes a mistake, public pressure gets the work done.", "score": 1},
                    {"text": "A bit annoying, but when project deadlines approach people get stressed and vent.", "score": 3},
                    {"text": "It is unfair and mean — problems should be solved privately, not through humiliating public spam.", "score": 5},
                    {"text": "It is completely wrong — gang-up tagging is public harassment that causes intense stress and embarrassment.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do mature classmates expect when someone starts spamming and calling out a peer in the group?",
                "options": [
                    {"text": "Most students find it funny and join in tagging the person as well.", "score": 1},
                    {"text": "People mute the chat and ignore the flood of messages.", "score": 3},
                    {"text": "Responsible students expect someone to message: 'Please discuss this in private DMs.'", "score": 5},
                    {"text": "Good peers expect members to tell {initiator_name} to stop the spam and handle issues respectfully.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that sending a calm message in the group can stop mass-tagging?",
                "options": [
                    {"text": "Not confident — angry students will just start tagging and attacking me too.", "score": 1},
                    {"text": "Unsure — it is hard to stop people once a group spam trend starts.", "score": 3},
                    {"text": "Fairly confident — a calm message reminding people to talk in private usually cools down the chat.", "score": 5},
                    {"text": "Very confident — I can say clearly in the chat to stop, and ask the group admin to mute the spammer.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do while watching {target_name} get spam-tagged and insulted?",
                "options": [
                    {"text": "Tag {target_name} once as well just to be funny.", "score": 1},
                    {"text": "Mute the group and wait for the spam to quiet down.", "score": 3},
                    {"text": "Send a message in the chat: 'Please discuss this privately, no need to spam the group.'", "score": 5},
                    {"text": "Call out the spam in the group, ask the admin to step in, and message {target_name} to check on them.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If you are leading a group project in the future and a teammate falls behind, how will you handle it?",
                "options": [
                    {"text": "Call them out in the batch group so everyone knows they didn't contribute.", "score": 1},
                    {"text": "Ignore them and do all the work myself while staying angry.", "score": 3},
                    {"text": "Talk to them privately, understand what happened, and agree on a realistic deadline.", "score": 5},
                    {"text": "Talk to them with empathy, help them catch up, and solve issues respectfully without public shaming.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe publicly embarrassing a classmate ever produces good teamwork or results?",
                "options": [
                    {"text": "Yes — fear of public embarrassment is the only way to get lazy students to work.", "score": 1},
                    {"text": "Sometimes — strict pressure produces results in tough situations.", "score": 3},
                    {"text": "No — embarrassing someone only causes anger, panic, and stops genuine cooperation.", "score": 5},
                    {"text": "Definitely not — public shaming destroys trust, hurts self-worth, and ruins team collaboration.", "score": 7},
                ],
            },
        ],
    },

    # =========================================================================
    # CATEGORY 3: UNIVERSITY & CAMPUS COMMUNITY (6 TEMPLATES)
    # =========================================================================
    {
        "template_key": "TEMPL_UC_PROJECT_EXCLUSION",
        "category": "university_community",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["GitHub", "Google Docs", "WhatsApp", "Discord", "University portals"],
        "departments": ["Computer Science", "Software Engineering", "Information Technology", "Engineering", "Business", "Any"],
        "livings": ["Any"],
        "context_tags": ["academic_sabotage", "group_project", "silent_removal", "credit_theft"],
        "personalization_tags": {
            "media_type": "shared_repository",
            "social_habits": ["Academic communication", "Collaborative projects"],
        },
        "narrative_variations": [
            (
                "Two days before the final submission for {academic_task}, group leader {initiator_name} secretly removes {target_name} "
                "from the shared project document, erasing their assigned sections without telling them. "
                "{initiator_name} tells the rest of the group that they will submit the project without {target_name}'s name, "
                "which will cause {target_name} to fail the semester project. Teammates know {target_name} contributed, but stay silent to protect their own marks."
            ),
            (
                "During the final days of {academic_task}, {initiator_name} locks {target_name} out of the shared slides and report. "
                "When {target_name} asks for access, {initiator_name} lies in the group chat, saying {target_name} never did any work. "
                "Teammates know {target_name} finished their part, but nobody speaks up when {initiator_name} submits the project without {target_name}."
            ),
            (
                "A few days before the final presentation of {academic_task}, {initiator_name} edits the group report to remove all of {target_name}'s work. "
                "{initiator_name} warns the other group members that if anyone tells the teacher, the whole team might lose marks. "
                "{target_name} finds out on presentation day that their name has been completely deleted."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about removing a group member's name and work right before a deadline without telling them?",
                "options": [
                    {"text": "Leaders have to make tough decisions; if someone wasn't fast enough, they deserve it.", "score": 1},
                    {"text": "A bit harsh, but group projects are competitive and everyone must look out for their own grade.", "score": 3},
                    {"text": "It is completely unfair and dishonest — cutting someone off without discussion is academic sabotage.", "score": 5},
                    {"text": "It is an intolerable act of dishonesty and bullying that steals someone's hard work and damages their future.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would fair and honest group members expect when someone tries to drop a teammate without warning?",
                "options": [
                    {"text": "They would stay quiet so their own marks aren't put at risk.", "score": 1},
                    {"text": "They would prefer to stay neutral and let the team leader make the call.", "score": 3},
                    {"text": "They would expect members to stand up for fairness and give the teammate their rightful credit.", "score": 5},
                    {"text": "They would refuse to submit the project until {target_name}'s legitimate work is included.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can stand up to a dominant group leader who is treating a teammate unfairly?",
                "options": [
                    {"text": "Not confident — challenging the leader might put my own project marks at risk.", "score": 1},
                    {"text": "A bit hesitant — I would feel uncomfortable arguing with someone who is bossy.", "score": 3},
                    {"text": "Fairly confident — I can show the document history and proof of {target_name}'s work to ensure fairness.", "score": 5},
                    {"text": "Fully confident — I can speak up in the group, show proof to the teacher if needed, and defend {target_name}.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you were on this project team?",
                "options": [
                    {"text": "Keep quiet, submit with the leader, and take my good grade.", "score": 1},
                    {"text": "Feel uncomfortable, but avoid speaking up to prevent group conflict before the deadline.", "score": 3},
                    {"text": "Tell {initiator_name} privately that dropping {target_name} is wrong and urge them to put their name back.", "score": 5},
                    {"text": "Clearly tell the team that I will not submit unless {target_name}'s work is included, and inform the teacher if needed.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If {target_name} is in distress and panicking about failing the course, how will you support them?",
                "options": [
                    {"text": "Tell them that that's how university life is and to retake the course next semester.", "score": 1},
                    {"text": "Feel sorry for them, but tell them I can't get involved because my own marks are on the line.", "score": 3},
                    {"text": "Give them copies and timestamps of their work so they can prove their contributions to the professor.", "score": 5},
                    {"text": "Go with them to the professor's office and confirm that they did their share of the project work.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe taking credit for a teammate's work or deleting their name is a form of cheating?",
                "options": [
                    {"text": "No — group work is about whatever team members agree to submit.", "score": 1},
                    {"text": "Not cheating, just a messy group disagreement.", "score": 3},
                    {"text": "Yes — taking credit for someone else's effort is dishonest and unfair.", "score": 5},
                    {"text": "Definitely — academic honesty means giving full credit to everyone who contributed to the work.", "score": 7},
                ],
            },
        ],
    },
    {
        "template_key": "TEMPL_UC_HOSTEL_SHAMING",
        "category": "university_community",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Discord", "Instagram"],
        "departments": ["Any"],
        "livings": ["University hostel", "Shared apartment"],
        "context_tags": ["hostel_life", "shared_living", "night_chat", "roommate_shaming", "cultural_prejudice"],
        "personalization_tags": {
            "media_type": "living_space_chat",
            "social_habits": ["Group chats", "Residential life"],
        },
        "narrative_variations": [
            (
                "Late at night in a university hostel floor {platform} group, {initiator_name} and several residents secretly photograph {target_name} "
                "asleep in their room. They post the photos with mocking comments about their appearance and sleeping habits, "
                "saying {target_name} should be forced to change rooms. "
                "{target_name} is fast asleep and has no idea their private room is being posted online."
            ),
            (
                "In a shared student flat {platform} group, {initiator_name} posts photos of {target_name}'s personal belongings and food, "
                "making fun of their hometown and habits. The messages turn into an agreement "
                "to ignore {target_name} and make living there so uncomfortable that they leave the apartment on their own."
            ),
            (
                "Across a hostel wing {platform} chat, residents circulate voice notes mocking {target_name}'s routine and habits. "
                "Several residents reply with laughing emojis, while others read silently without intervening. "
                "The next morning, {target_name} notices hostile whispers and stares in the hallway."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about taking photos of a roommate sleeping and posting them in a hostel group chat?",
                "options": [
                    {"text": "It is normal hostel culture; everyone who lives in a dorm gets roasted.", "score": 1},
                    {"text": "A bit invasive, but room teasing is part of shared student living.", "score": 3},
                    {"text": "It is a serious violation of privacy that makes someone feel unsafe in their own room.", "score": 5},
                    {"text": "It is completely unacceptable — everyone deserves to feel safe and respected where they sleep.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do sensible hostel residents expect when people start making fun of a roommate in the floor chat?",
                "options": [
                    {"text": "They expect people to laugh along so they don't get targeted next.", "score": 1},
                    {"text": "They expect people to stay silent and mind their own business.", "score": 3},
                    {"text": "Sensible residents quietly disapprove and respect peers who refuse to join in.", "score": 5},
                    {"text": "They respect anyone who has the courage to say that targeting roommates crosses the line.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can speak up for a roommate without making your own hostel life difficult?",
                "options": [
                    {"text": "Not confident — creating friction on your own hostel floor makes people turn against you.", "score": 1},
                    {"text": "Unsure — I would worry that residents would start teasing me instead.", "score": 3},
                    {"text": "Fairly confident — I can calmly tell the group that taking photos of sleeping roommates is wrong.", "score": 5},
                    {"text": "Very confident — I can speak up in the chat, support {target_name}, and report repeated harassment to the hostel warden.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do upon seeing these mocking late-night messages on {platform}?",
                "options": [
                    {"text": "Mute the chat and check the gossip in the morning with curiosity.", "score": 1},
                    {"text": "Read the messages in silence and avoid taking any side.", "score": 3},
                    {"text": "Send a brief message in the group: 'Taking photos of people sleeping is not okay, please delete.'", "score": 5},
                    {"text": "Demand the photos be deleted immediately, tell {initiator_name} this is wrong, and check on {target_name}.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If {target_name} learns about the chat the next morning and is visibly upset, how will you respond?",
                "options": [
                    {"text": "Avoid eye contact and pretend I know nothing about what happened.", "score": 1},
                    {"text": "Tell them to ignore it because hostel guys always joke around like that.", "score": 3},
                    {"text": "Talk with them privately, reassure them, and let them know not everyone agrees with the bullies.", "score": 5},
                    {"text": "Stand by them, help them speak with the hostel warden if needed, and make sure they feel safe.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe a student's hostel room should be a safe space protected from online teasing?",
                "options": [
                    {"text": "No — once you share a room or dorm, you give up your right to privacy.", "score": 1},
                    {"text": "It depends on how close you are with your roommates.", "score": 3},
                    {"text": "Yes — everyone deserves a safe place where they can rest without fear of being filmed.", "score": 5},
                    {"text": "Definitely — a student's living space must always be respected, and violating it is never acceptable.", "score": 7},
                ],
            },
        ],
    },
    {
        "template_key": "TEMPL_UC_SOCIETY_SMEAR",
        "category": "university_community",
        "difficulty_level": 3,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Instagram", "Discord", "University portals"],
        "departments": ["Any"],
        "livings": ["Any"],
        "context_tags": ["student_society", "elections", "smear_campaign", "fabricated_rumors"],
        "personalization_tags": {
            "media_type": "community_election",
            "social_habits": ["University communities", "Social interaction"],
        },
        "narrative_variations": [
            (
                "During elections for the departmental student society, {initiator_name} starts a digital rumor campaign "
                "against rival candidate {target_name}. They share fake screenshots and anonymous voice notes on {platform} claiming "
                "{target_name} misused society funds. The false posts spread quickly across all batch WhatsApp groups."
            ),
            (
                "When {target_name} is shortlisted to lead a university student club, {initiator_name} creates fake accounts "
                "on {platform} to comment on club posts, falsely accusing {target_name} of cheating on assignments in {academic_task}. "
                "Classmates start questioning {target_name}'s honesty, and the teacher in charge considers dropping their name."
            ),
            (
                "In an election for class representative (CR), {initiator_name} launches aggressive online attacks against {target_name}. "
                "They flood campus {platform} groups with edited photos and sarcastic memes attacking {target_name}'s family and background, "
                "turning a simple student election into a personal attack."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about spreading fake rumors about a classmate during student society elections?",
                "options": [
                    {"text": "All is fair in elections — spreading rumors is just part of campus politics and competition.", "score": 1},
                    {"text": "A dirty tactic, but anyone running for a post should expect personal attacks.", "score": 3},
                    {"text": "It is dishonest and wrong — making up false rumors to win damages someone's character unfairly.", "score": 5},
                    {"text": "It is completely unacceptable behavior that ruins student trust and deeply harms an innocent person.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do honest student leaders and teachers expect when rumors circulate during campus elections?",
                "options": [
                    {"text": "Most students forward the gossip to see who wins.", "score": 1},
                    {"text": "People watch silently and wait for the election to pass.", "score": 3},
                    {"text": "Responsible students ask for proof before believing or forwarding anonymous claims.", "score": 5},
                    {"text": "Good student leaders expect peers to report fake rumors and reject negative campaigning.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can help stop false rumors spread in batch WhatsApp groups?",
                "options": [
                    {"text": "Not confident — once a rumor starts on WhatsApp, students believe it without questioning.", "score": 1},
                    {"text": "Unsure — getting involved in campus politics might make people target me too.", "score": 3},
                    {"text": "Fairly confident — I can ask the group for proof and point out that anonymous rumors shouldn't be trusted.", "score": 5},
                    {"text": "Very confident — I can challenge the rumors openly, urge classmates not to spread them, and support {target_name}.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do when you receive an unverified rumor attacking {target_name}?",
                "options": [
                    {"text": "Forward it to other friends to keep them updated on the drama.", "score": 1},
                    {"text": "Read the message and stay quiet without checking if it's true.", "score": 3},
                    {"text": "Refuse to forward it, and ask the sender if they have any actual proof.", "score": 5},
                    {"text": "Tell the group that spreading unverified rumors is wrong, and let {target_name} know so they can clear their name.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If the teacher in charge is considering dropping {target_name} due to the rumors, what will you do?",
                "options": [
                    {"text": "Stay out of teacher matters entirely to protect my own position.", "score": 1},
                    {"text": "Feel bad for {target_name}, but assume the truth will come out eventually.", "score": 3},
                    {"text": "Encourage {target_name} to meet the teacher and explain the truth with facts.", "score": 5},
                    {"text": "Go with {target_name} to the teacher to confirm that the rumors were fabricated by rivals.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe winning a student election is ever worth destroying a classmate's reputation?",
                "options": [
                    {"text": "Yes — winning is what matters most, and politics is always tough.", "score": 1},
                    {"text": "Sometimes — if the other candidate is bad, any tactic is acceptable.", "score": 3},
                    {"text": "No — no student society title is worth ruining a classmate's honor and peace of mind.", "score": 5},
                    {"text": "Never — spreading lies to win an election corrupts the entire university community.", "score": 7},
                ],
            },
        ],
    },
    {
        "template_key": "TEMPL_UC_LMS_BRIGADE",
        "category": "university_community",
        "difficulty_level": 1,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["University portals", "Discord", "WhatsApp"],
        "departments": ["Any"],
        "livings": ["Any"],
        "context_tags": ["lms_forum", "discussion_board", "coordinated_downvoting", "public_ridicule"],
        "personalization_tags": {
            "media_type": "lms_discussion_board",
            "social_habits": ["Academic communication", "Course forums"],
        },
        "narrative_variations": [
            (
                "On the official university LMS discussion board for {academic_task}, {target_name} asks a thoughtful question about lecture topics. "
                "{initiator_name} coordinates with friends in a private chat to reply with rude comments telling {target_name} "
                "to 'stop trying to impress the professor.' They spam sarcastic replies on the thread before the teacher logs in."
            ),
            (
                "During online peer reviews on the university LMS for {academic_task}, {initiator_name} and several friends "
                "leave identical harsh, mocking reviews on {target_name}'s submission, giving zero marks across the board. "
                "In their private WhatsApp group, they laugh about how they lowered {target_name}'s score."
            ),
            (
                "On the LMS course discussion forum, {target_name} shares a helpful article related to {academic_task}. "
                "{initiator_name} replies publicly with condescending remarks making fun of {target_name}'s intelligence, "
                "telling other students not to reply to {target_name}'s posts."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about leaving rude comments and mocking a classmate on official university LMS forums?",
                "options": [
                    {"text": "Students who post too much on LMS deserve pushback for trying to show off to teachers.", "score": 1},
                    {"text": "A bit immature, but forum arguments happen in every university course.", "score": 3},
                    {"text": "It is completely wrong — using official study portals to make fun of someone ruins the learning space.", "score": 5},
                    {"text": "It is unacceptable bullying that discourages students from asking questions and participating in class.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do professors and serious university students expect when peers post on course discussion boards?",
                "options": [
                    {"text": "They expect people to stay silent and only post when forced to by grades.", "score": 1},
                    {"text": "They expect sarcasm and jokes from students.", "score": 3},
                    {"text": "They expect polite discussions, honest questions, and helpful answers.", "score": 5},
                    {"text": "They expect mutual respect, encouraging replies, and serious academic teamwork.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can reply helpfully to support an LMS post that is being mocked?",
                "options": [
                    {"text": "Not confident — jumping into a hostile thread makes people start teasing me too.", "score": 1},
                    {"text": "Unsure — I don't want to get involved in public arguments on the LMS.", "score": 3},
                    {"text": "Fairly confident — I can leave a polite, well-thought-out reply answering {target_name}'s question.", "score": 5},
                    {"text": "Very confident — I can answer {target_name}'s question nicely and email the professor if the harassment continues.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do upon seeing this hostile teasing on the LMS forum?",
                "options": [
                    {"text": "Read the drama and maybe give one of the sarcastic replies a thumbs up.", "score": 1},
                    {"text": "Log off the LMS and avoid the thread.", "score": 3},
                    {"text": "Leave a helpful, supportive reply on {target_name}'s post to restore normal discussion.", "score": 5},
                    {"text": "Reply with a helpful answer, say that mocking queries is uncalled for, and inform the teacher if needed.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "In future online course discussions, how will you participate to keep discussions positive?",
                "options": [
                    {"text": "Post only the bare minimum required words and never talk to anyone.", "score": 1},
                    {"text": "Reply only to my closest friends in the class.", "score": 3},
                    {"text": "Reply to classmates with polite, encouraging, and helpful comments.", "score": 5},
                    {"text": "Help create an open, welcoming atmosphere where every student feels comfortable asking questions.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe insulting classmates on official university platforms should have academic consequences?",
                "options": [
                    {"text": "No — online comments should never affect a student's real academic record.", "score": 1},
                    {"text": "Only if very bad words are used, otherwise it's just student banter.", "score": 3},
                    {"text": "Yes — bullying in official university spaces breaks student conduct rules.", "score": 5},
                    {"text": "Definitely — official learning platforms require respect, and harassing classmates should not be allowed.", "score": 7},
                ],
            },
        ],
    },
    {
        "template_key": "TEMPL_UC_LAB_PARTNER_ABUSE",
        "category": "university_community",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Discord", "University portals"],
        "departments": ["Engineering", "Computer Science", "Medical / Health Sciences", "Medical Sciences", "Information Technology", "Any"],
        "livings": ["Any"],
        "context_tags": ["lab_practical", "partner_abandonment", "public_scapegoating", "workload_dumping"],
        "personalization_tags": {
            "media_type": "lab_coordination",
            "social_habits": ["Academic communication", "Practical sessions"],
        },
        "narrative_variations": [
            (
                "In a laboratory session for {academic_task}, partner {initiator_name} fails to show up on time, "
                "leaving {target_name} to do the entire practical alone under time pressure. "
                "When a small error happens, {initiator_name} takes to the departmental {platform} group, "
                "publicly blaming {target_name} and claiming they ruined the lab marks through incompetence."
            ),
            (
                "During a collaborative lab practical in {academic_task}, {initiator_name} refuses to do their share of the work, "
                "spending the lab session on their phone. When grades are announced and marks are lost for missing data, "
                "{initiator_name} posts in the class {platform} chat claiming {target_name} 'ruined our GPA.'"
            ),
            (
                "Assigned as lab partners in {academic_task}, {initiator_name} demands that {target_name} write all weekly reports alone. "
                "When {target_name} politely asks to divide the writing fairly, {initiator_name} retaliates by posting rude messages "
                "in the batch group calling {target_name} 'selfish and impossible to work with.'"
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about leaving all the lab work to your partner and then publicly blaming them in class chats?",
                "options": [
                    {"text": "Smart move — you have to defend your own grade before your partner blames you.", "score": 1},
                    {"text": "Dishonest, but partner fights in university labs happen all the time.", "score": 3},
                    {"text": "Unfair and cowardly — dumping work on someone and then blaming them publicly is wrong.", "score": 5},
                    {"text": "It is completely unacceptable behavior that exploits a teammate and damages their reputation.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do teachers and honest classmates expect when partner disagreements happen in lab practicals?",
                "options": [
                    {"text": "Whoever complains louder in the group chat usually gets believed.", "score": 1},
                    {"text": "People expect partners to argue it out privately without involving others.", "score": 3},
                    {"text": "Honest classmates expect partners to communicate maturely and share work fairly.", "score": 5},
                    {"text": "Teachers expect honest teamwork, fair division of tasks, and respectful communication.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can help explain what really happened if you saw the lab session?",
                "options": [
                    {"text": "Not confident — getting between lab partners is messy and will only bring trouble.", "score": 1},
                    {"text": "Unsure — unless the lab teacher asks me directly, I would stay out of it.", "score": 3},
                    {"text": "Fairly confident — I can confirm that {target_name} worked hard and that {initiator_name} did not help.", "score": 5},
                    {"text": "Very confident — I can speak up in the group to stop false blame and confirm the truth to the lab instructor.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do upon seeing {initiator_name} blame {target_name} in the class chat?",
                "options": [
                    {"text": "Read the argument and post laughing emojis in the chat.", "score": 1},
                    {"text": "Stay quiet and feel glad that I'm not in their lab group.", "score": 3},
                    {"text": "Message {target_name} privately to say I saw them working hard in lab and support them.", "score": 5},
                    {"text": "Post in the chat that {target_name} worked alone, and encourage them to show their work to the teacher.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If you are partnered with someone who is struggling with lab tasks in the future, what will you do?",
                "options": [
                    {"text": "Do only my part and let them struggle with theirs.", "score": 1},
                    {"text": "Complain to other friends about how slow my partner is.", "score": 3},
                    {"text": "Patiently go through the steps together and divide the work fairly based on strengths.", "score": 5},
                    {"text": "Work together patiently, help them understand the steps, and make sure both of us learn.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe being good at lab work gives any student the right to mistreat their partner?",
                "options": [
                    {"text": "Yes — top students have higher standards and shouldn't be slowed down by weaker partners.", "score": 1},
                    {"text": "Somewhat — getting frustrated is natural when your grade depends on someone else.", "score": 3},
                    {"text": "No — skill means nothing if you don't treat your partners with fairness and respect.", "score": 5},
                    {"text": "Definitely not — true success in university means being both competent and a supportive teammate.", "score": 7},
                ],
            },
        ],
    },
    {
        "template_key": "TEMPL_UC_COMMUTER_ISOLATION",
        "category": "university_community",
        "difficulty_level": 1,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Instagram", "Discord"],
        "departments": ["Any"],
        "livings": ["Home with family", "Shared apartment"],
        "context_tags": ["commuter_students", "hostel_clique", "academic_exclusion", "social_isolation"],
        "personalization_tags": {
            "media_type": "cohort_chat",
            "social_habits": ["Group chats", "Off-campus living"],
        },
        "narrative_variations": [
            (
                "Because {target_name} commutes two hours daily on the university point bus, they cannot stay late on campus. "
                "A clique of hostel residents led by {initiator_name} plans late-night study sessions for {academic_task}, "
                "while making fun of day-scholar commuter students in the main {platform} group as 'day-scholars who contribute nothing.' "
                "{target_name} is left disconnected from important study notes and group work."
            ),
            (
                "When {target_name} asks if a mandatory group meeting for {academic_task} can be held before 5 PM so they can catch the point bus, "
                "{initiator_name} replies rudely in the class group: 'If you can't stay on campus until 9 PM, why did you take this degree?' "
                "The group deliberately schedules meetings at night and then blames {target_name} for missing them."
            ),
            (
                "A group of hostel resident students refuses to partner with commuter students like {target_name} for {academic_task}. "
                "In their {platform} group, {initiator_name} shares sarcastic memes calling day-scholars outsiders who don't belong, "
                "creating a sharp divide between hostelites and day-scholars."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about resident students excluding day-scholar commuter students and making fun of their schedule?",
                "options": [
                    {"text": "Commuters should make arrangements to stay late if they want the full university experience.", "score": 1},
                    {"text": "A natural divide — hostel students naturally bond more, and it's inconvenient to adjust for commuters.", "score": 3},
                    {"text": "It is unfair and exclusionary — making fun of someone because of their commute or bus schedule is wrong.", "score": 5},
                    {"text": "It is completely unacceptable elitism that divides the batch and hurts students unfairly.", "score": 7},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do mature and fair university students expect regarding group meeting times?",
                "options": [
                    {"text": "They expect commuter students to adjust to whatever the majority resident group wants.", "score": 1},
                    {"text": "They don't think about scheduling fairness.", "score": 3},
                    {"text": "They expect groups to find daytime hours or use online tools so everyone can join.", "score": 5},
                    {"text": "They expect genuine consideration that respects everyone's transport, family, and home constraints.", "score": 7},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can suggest meeting times that work for commuter classmates?",
                "options": [
                    {"text": "Not confident — hostel students outnumber commuters and will always insist on late nights.", "score": 1},
                    {"text": "Unsure — I wouldn't want to argue with hostel friends over meeting times.", "score": 3},
                    {"text": "Fairly confident — I can suggest daytime library hours or an online call so {target_name} can join.", "score": 5},
                    {"text": "Very confident — I can propose fair meeting times and ensure that no classmate is left out due to the bus.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you saw {target_name} being made fun of for needing to catch the point bus?",
                "options": [
                    {"text": "Agree with the residents that early departures make group work frustrating.", "score": 1},
                    {"text": "Stay quiet and let them work out their transport issues.", "score": 3},
                    {"text": "Suggest having meetings online or during free class slots so {target_name} can fully participate.", "score": 5},
                    {"text": "Remind the group that commuting is a reality for many, insist on daytime meetings, and share all notes with {target_name}.", "score": 7},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "How do you plan to promote inclusion between hostel and commuter students in your classes?",
                "options": [
                    {"text": "Stick to my own circle of friends and not worry about commuter vs hostelite divides.", "score": 1},
                    {"text": "Be polite if asked, but make no special effort.", "score": 3},
                    {"text": "Support sharing all notes and updates online so off-campus students are never left behind.", "score": 5},
                    {"text": "Actively welcome diverse classmates into project groups and make sure everyone feels included.", "score": 7},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe every student deserves an equal chance to work on projects without being mocked for their living situation?",
                "options": [
                    {"text": "No — university teamwork is based on who you are friends with.", "score": 1},
                    {"text": "Ideally yes, but hard to do in practice.", "score": 3},
                    {"text": "Yes — every student deserves an equal chance to participate without facing mockery.", "score": 5},
                    {"text": "Definitely — university life is better when every student, whether in hostel or commuting, is respected.", "score": 7},
                ],
            },
        ],
    },
]
