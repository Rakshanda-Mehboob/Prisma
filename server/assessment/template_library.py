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
                "{target_name} is an undergraduate student who frequently visits the campus central library between classes. During a quiet evening study session before midterms, someone snapped a candid photograph without permission. An anonymous campus confession page on {platform} posted the picture with a mocking caption insulting their appearance. Within an hour, dozens of students reacted with laughing emojis and began tagging classmates in the comment section. Some peers scrolled past quietly, while a few close friends felt genuinely uncomfortable with the attention. {target_name} stopped visiting the library, turned off their phone notifications, and skipped the next morning lecture. A student sitting in the library saw the original photo being taken and opened the active thread."
            ),
            (
                "{target_name} is a university student who commutes daily on the campus shuttle bus. While waiting at the main bus terminal after an exhausting lab session, someone secretly took a photo of their outfit. A popular campus student page on {platform} uploaded the picture alongside a sarcastic poll rating their appearance. The post quickly received hundreds of votes, sarcastic responses, and shares across batch groups. Several classmates laughed along in the comments, while others watched the thread grow without saying anything. {target_name} began catching private buses, avoided waiting at the terminal, and stopped replying in class chats. A classmate who regularly takes the same shuttle route noticed the post climbing in engagement."
            ),
            (
                "{target_name} is an enrolled student who regularly eats lunch in the busy campus student cafeteria. During a crowded break, someone secretly took a picture of them eating alone at a corner table. A student meme page on {platform} published the photograph with an insulting caption mocking their social habits. The post circulated rapidly through departmental groups, earning laughing reactions and hurtful remarks from peers. A few students felt the post crossed a boundary, but nobody called it out publicly. {target_name} stopped eating at the cafeteria, packed lunch to eat outside, and walked alone between buildings. Another student sitting two tables away had watched the photograph being taken and saw the meme go live."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about taking photos of classmates without permission and posting them on confession pages?",
                "options": [
                    {"text": "It is just harmless fun; confession pages are a normal part of student life.", "score": 0},
                    {"text": "A little rude, but students should expect their pictures might be taken in public.", "score": 1},
                    {"text": "It is wrong and hurtful because mocking someone publicly causes real embarrassment.", "score": 2},
                    {"text": "It is completely unacceptable and a clear form of online bullying that hurts people.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "How do you think this post will affect {target_name}?",
                "options": [
                    {"text": "It won't affect them at all; people forget social media posts in one day.", "score": 0},
                    {"text": "They might feel slightly embarrassed, but they should learn to brush it off.", "score": 1},
                    {"text": "It will make them feel anxious, upset, and uncomfortable coming to campus.", "score": 2},
                    {"text": "It will cause serious emotional distress and make them feel unsafe among their peers.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would your close friends expect you to do regarding this post?",
                "options": [
                    {"text": "They would expect me to laugh and tag other friends in the comments.", "score": 0},
                    {"text": "They would expect me to just ignore it because it's none of our business.", "score": 1},
                    {"text": "They would expect me not to like, share, or encourage the post.", "score": 2},
                    {"text": "They would support me if I reported the post and asked the page admin to delete it.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can do something helpful in this situation?",
                "options": [
                    {"text": "Not confident at all — one student cannot do anything against a big campus page.", "score": 0},
                    {"text": "A bit unsure — I worry that speaking up might turn people against me.", "score": 1},
                    {"text": "Fairly confident — I can message {target_name} to support them and report the post on {platform}.", "score": 2},
                    {"text": "Very confident — I can report the post, ask friends to flag it, and stand by {target_name}.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you saw this post on {platform}?",
                "options": [
                    {"text": "Read the comments for entertainment and maybe share it with a friend.", "score": 0},
                    {"text": "Scroll past the post without saying or doing anything.", "score": 1},
                    {"text": "Report the post quietly and send a friendly private message to check on {target_name}.", "score": 2},
                    {"text": "Report the post, message the page admin to take it down, and offer direct support to {target_name}.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If you notice {target_name} looking quiet and sitting alone over the next few days, what will you do?",
                "options": [
                    {"text": "Ignore it — students need to handle their own personal issues.", "score": 0},
                    {"text": "Feel bad for them from a distance, but do nothing.", "score": 1},
                    {"text": "Sit with them or invite them to study together so they don't feel left out.", "score": 2},
                    {"text": "Check in on them warmly, let them know they have friends here, and help them if needed.", "score": 3},
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
                "{target_name} and {initiator_name} are classmates completing a graded group presentation for {academic_task}. During the session, {target_name} momentarily lost their train of thought and stuttered through two presentation slides. Right after class, {initiator_name} posted a story poll on {platform} asking followers to vote on the most embarrassing speaker. Classmates quickly voted in the poll, leaving laughing stickers and resharing the story into smaller private chats. Some group members felt the poll was unfair but chose not to intervene publicly. {target_name} left the lecture hall immediately, muted the course group chat, and skipped the afternoon tutorial session. A classmate who sat in the front row watched {initiator_name} create the poll right after class ended."
            ),
            (
                "{target_name} was delivering an individual seminar presentation for {academic_task} in front of the entire section. Due to a technical issue with the projector remote, they fumbled the slides and paused awkwardly for several seconds. A student in the third row recorded the flustered moment and posted it on {platform} with sarcastic background music. By evening, the clip was viewed by over eighty students, collecting mocking remarks and laughing reactions. Several classmates watched in silence, feeling uneasy about the public ridicule. {target_name} stopped contributing to the course forum, avoided eye contact with peers, and left campus straight after class. A student who partnered with {target_name} on earlier assignments saw the video appear on their feed."
            ),
            (
                "{target_name} presented their preliminary findings for {academic_task} during a departmental seminar. While answering a challenging question from the professor, their voice cracked and they gave an incomplete answer. {initiator_name} immediately uploaded a sarcastic quiz on {platform} asking who gave the worst academic answer of the week. Multiple students from the section selected {target_name}'s name, leaving jokes and laughing reactions in the comments. Some peers noticed the cruelty of the poll but kept their thoughts to themselves. {target_name} packed their bag before the seminar concluded, avoided the common area, and did not attend the next session. A peer who prepared alongside {target_name} saw the notification pop up on their smartphone."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about posting polls online to make fun of a classmate's presentation?",
                "options": [
                    {"text": "It is just light teasing; presenting in class means you should be ready for criticism.", "score": 0},
                    {"text": "A bit unkind, but people post silly polls all the time without bad intentions.", "score": 1},
                    {"text": "It is mean and hurtful because it publicly shames someone who was trying their best.", "score": 2},
                    {"text": "It is completely unacceptable bullying that discourages students from speaking up in class.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would good classmates expect you to do when this story appears?",
                "options": [
                    {"text": "They would expect me to vote in the poll and laugh along.", "score": 0},
                    {"text": "They would expect me to just swipe past and stay out of it.", "score": 1},
                    {"text": "They would expect me not to vote or encourage the poll.", "score": 2},
                    {"text": "They would respect me for telling {initiator_name} that the poll is unfair and should be deleted.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can handle this situation in a helpful way?",
                "options": [
                    {"text": "Not confident — speaking up against popular students only causes problems for yourself.", "score": 0},
                    {"text": "Unsure — I would want to help, but I wouldn't know what words to say.", "score": 1},
                    {"text": "Fairly confident — I can privately tell {initiator_name} that the poll is hurtful.", "score": 2},
                    {"text": "Very confident — I can ask {initiator_name} to delete the poll and send encouragement to {target_name}.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you realistically do when you see this story on {platform}?",
                "options": [
                    {"text": "Vote in the poll to see what others chose.", "score": 0},
                    {"text": "Swipe past without voting or reacting.", "score": 1},
                    {"text": "Refuse to vote, and send {target_name} a nice message about their effort.", "score": 2},
                    {"text": "Ask {initiator_name} privately to take down the poll, and compliment {target_name}'s presentation.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "In future class presentations, how do you plan to support your classmates?",
                "options": [
                    {"text": "Just focus on my own presentation and ignore others.", "score": 0},
                    {"text": "Stay quiet unless the teacher asks for comments.", "score": 1},
                    {"text": "Make sure to clap and say something encouraging when nervous presenters finish.", "score": 2},
                    {"text": "Actively encourage nervous peers and make sure our group never tolerates making fun of mistakes.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe that making fun of mistakes in class stops students from participating in the future?",
                "options": [
                    {"text": "No — students should just be tough and not care what others think.", "score": 0},
                    {"text": "Maybe a little, but most students get over it quickly.", "score": 1},
                    {"text": "Yes — fear of being made fun of makes students scared to raise their hand or present.", "score": 2},
                    {"text": "Definitely — mockery destroys confidence and prevents students from learning properly.", "score": 3},
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
                "{target_name} is a student in your academic batch who regularly walks across the central university courtyard. While carrying a heavy stack of assignment files, they tripped on the concrete stairs and dropped everything. A bystander filmed the entire fall on a smartphone and uploaded the video to {platform} with dramatic sound effects. Within hours, the clip gathered dozens of shares, laughing comments, and sarcastic tags from mutual classmates. A few students who witnessed the accident in person felt uncomfortable with the humiliation online. {target_name} quickly gathered their scattered papers, left campus for the day, and deleted their profile picture. A student who helped pick up two fallen folders later saw the viral clip recommended on their feed."
            ),
            (
                "{target_name} was rushing across the campus rain-soaked corridor to submit a late coursework assignment for {academic_task}. They slipped on the slick tiles, dropping their backpack and scattering their personal belongings across the floor. {initiator_name} recorded the slip from the cafeteria balcony and shared the footage across {platform} as a meme reel. The video gained traction across multiple student batches, attracting teasing emojis and mocking remarks. Several classmates watched without commenting, unsure whether speaking up would make things worse. {target_name} hurriedly retrieved their belongings, did not attend their remaining lab, and turned off incoming direct messages. A classmate standing near the noticeboard watched the recording happen in real time."
            ),
            (
                "{target_name} was practicing a speech for an upcoming student council debate near the open campus amphitheater. They stumbled over their opening lines and repeated the same sentence three times while checking their notes. A student nearby secretly recorded the rehearsal and posted the clip to {platform} with a humiliating caption. Students from competing departments reshared the video, leaving dismissive comments and mocking their public speaking capability. Some peers recognized the effort involved and felt the video was unfair, but stayed quiet. {target_name} withdrew their council nomination the following morning and sat at the back of the lecture room. A peer who supported the campaign saw the video circulating in several student group chats."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about secretly filming classmates and posting the video online for laughs?",
                "options": [
                    {"text": "It is normal internet humor; if you are in public, anyone can film you.", "score": 0},
                    {"text": "A bit annoying, but viral videos happen every day and nobody means true harm.", "score": 1},
                    {"text": "It is wrong and disrespectful — filming someone without their consent to laugh at them crosses the line.", "score": 2},
                    {"text": "It is a serious violation of privacy that humiliates the person and makes campus feel unsafe.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do sensible students expect when a viral video makes fun of a classmate?",
                "options": [
                    {"text": "Most students forward it to friends because they find it funny.", "score": 0},
                    {"text": "Most students just watch it quietly without saying anything.", "score": 1},
                    {"text": "Sensible students refuse to like, comment, or share the video.", "score": 2},
                    {"text": "Good peers expect people to tell {initiator_name} that posting the video went too far and should be deleted.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident do you feel that you can help get an unfair video removed?",
                "options": [
                    {"text": "Not confident — once a video is online, regular students can't do anything about it.", "score": 0},
                    {"text": "A bit unsure — I know there is a report button, but I don't know if it works.", "score": 1},
                    {"text": "Fairly confident — I know how to report privacy violations and ask friends to report it too.", "score": 2},
                    {"text": "Very confident — I can report the video, support {target_name}, and ask {initiator_name} to take it down.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you saw this video appearing on your {platform} feed?",
                "options": [
                    {"text": "Watch it and maybe send it to a friend's private chat.", "score": 0},
                    {"text": "Ignore it and keep scrolling down my feed.", "score": 1},
                    {"text": "Report the video for bullying and avoid sharing it with anyone.", "score": 2},
                    {"text": "Report the video, message {initiator_name} to delete it, and check in on {target_name}.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "How do you plan to handle photos or videos of classmates on campus in the future?",
                "options": [
                    {"text": "Record whatever seems funny and post it on my private story.", "score": 0},
                    {"text": "Avoid posting, but keep funny videos of classmates saved on my phone.", "score": 1},
                    {"text": "Never record or share photos/videos of any student without asking them first.", "score": 2},
                    {"text": "Always respect people's privacy and speak up if someone tries to film a classmate without consent.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe that filming someone without their knowledge hurts their trust in fellow students?",
                "options": [
                    {"text": "No — everyone knows cameras are everywhere nowadays.", "score": 0},
                    {"text": "Only for a little while, until another funny video comes along.", "score": 1},
                    {"text": "Yes — it makes people anxious and constantly worried that they are being recorded.", "score": 2},
                    {"text": "Completely — it breaks trust on campus and makes students feel guarded and uncomfortable.", "score": 3},
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
                "{target_name} is a final-year student who recently published a thoughtful post on {platform} celebrating an internship milestone. They shared key lessons learned from their recent project work in {academic_task}. {initiator_name} left a harsh, sarcastic comment calling the achievement exaggerated and labeling the student incompetent. Within hours, several peers from the same academic circle joined the thread, piling on with mocking replies and patronizing remarks. A few senior students saw the dispute unfold and chose not to intervene. {target_name} deleted the celebratory post, restricted their account visibility, and stopped sharing academic milestones online. A fellow classmate who worked on the same internship team saw the hostile thread expanding."
            ),
            (
                "{target_name} shared an original research summary on {platform} regarding contemporary developments in {academic_task}. They expressed personal interest in pursuing graduate studies in the field. {initiator_name} publicly commented that the summary contained basic errors and questioned whether {target_name} understood the core concepts. Other students from competitive sections liked the critical remark and added dismissive comments beneath it. Some peers recognized the unnecessary cruelty but chose not to get involved publicly. {target_name} stopped contributing to student academic forums, avoided faculty office hours, and took down their project portfolio. A classmate who reviewed the original draft with {target_name} noticed the hostile comments accumulating."
            ),
            (
                "{target_name} posted an update on {platform} announcing that they had been selected as a student delegate for an academic conference. They thanked their mentors and peers for encouraging their work in {academic_task}. {initiator_name} posted a public reply insinuating that {target_name} secured the spot through favoritism rather than merit. Several classmates reshared the comment, adding sarcastic remarks and fueling an uncomfortable public debate. A handful of batchmates felt the attack was unwarranted but remained on the sidelines. {target_name} turned off public comments, did not attend the delegate orientation meeting, and kept silent in class. A fellow student delegate read through the thread while preparing their conference materials."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about leaving sarcastic or mocking comments on a classmate's achievements on {platform}?",
                "options": [
                    {"text": "It is fair — posting online means people can give you reality checks.", "score": 0},
                    {"text": "A bit petty, but students are naturally competitive about jobs and internships.", "score": 1},
                    {"text": "It is mean and unprofessional — tearing down a classmate's milestone crosses a clear line.", "score": 2},
                    {"text": "It is completely wrong and toxic behavior meant to hurt a peer's confidence and career.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would respected teachers and mature peers expect when a student posts about an achievement?",
                "options": [
                    {"text": "They expect people to compete hard and humble anyone who shows off.", "score": 0},
                    {"text": "They expect students to just mind their own business and stay out of it.", "score": 1},
                    {"text": "They expect polite congratulations, encouragement, or respectful silence.", "score": 2},
                    {"text": "They expect students to genuinely support and celebrate each other's successes.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that leaving a positive comment can help counter mean comments on {platform}?",
                "options": [
                    {"text": "Not confident — once people start making fun of someone, a positive comment looks silly.", "score": 0},
                    {"text": "A bit doubtful — one nice comment usually gets drowned out.", "score": 1},
                    {"text": "Fairly confident — leaving a supportive comment shows {target_name} that not everyone is mean.", "score": 2},
                    {"text": "Very confident — positive comments encourage other quiet classmates to speak up and show support.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you saw classmates leaving mean comments on {target_name}'s post?",
                "options": [
                    {"text": "Read the drama and smile without commenting.", "score": 0},
                    {"text": "Feel bad for {target_name}, but avoid commenting to stay out of trouble.", "score": 1},
                    {"text": "Post a genuine message saying 'Congratulations!' and message {target_name} privately.", "score": 2},
                    {"text": "Leave a supportive public comment praising their hard work and privately tell {initiator_name} to stop.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If a classmate is scared to share their project work because they fear being mocked, what will you tell them?",
                "options": [
                    {"text": "Agree with them that keeping quiet is the safest choice.", "score": 0},
                    {"text": "Tell them it's their choice and leave it at that.", "score": 1},
                    {"text": "Encourage them privately and tell them their work is valuable.", "score": 2},
                    {"text": "Remind them to be proud of their effort, offer to review their work, and cheer them on.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe healthy competition among students ever excuses making fun of someone's achievements?",
                "options": [
                    {"text": "Yes — the job market is tough, so people need to grow thick skin.", "score": 0},
                    {"text": "Sometimes — if someone boasts too much, they should expect some pushback.", "score": 1},
                    {"text": "No — healthy competition means working hard on yourself, not putting others down.", "score": 2},
                    {"text": "Never — making fun of a peer's success comes from jealousy and hurts the whole class atmosphere.", "score": 3},
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
                "{target_name} is an undergraduate student who frequently studies in the quiet corners of the campus library. During a long revision marathon for {academic_task}, they rested their head on their desk and fell asleep. {initiator_name} snapped a close-up photo and turned it into a viral meme circulated widely on {platform}. By evening, the meme was reshared across multiple section groups with laughing emojis and sarcastic captions. A few students thought the meme went too far, but nobody suggested deleting it. {target_name} stopped studying in the library, deactivated their social media profiles, and avoided group study tables. A student who shared a desk with {target_name} that afternoon opened the forwarded meme in a group."
            ),
            (
                "{target_name} was reviewing lecture notes on a cafeteria bench while having lunch between consecutive classes. They accidentally spilled water on their assignment folder and scrambled to save the handwritten pages. A student sitting across recorded the clumsy moment and posted a sticker pack on {platform} ridiculing their reaction. The sticker pack was adopted across departmental chats, with peers using it to respond to unrelated messages. Some students found the joke repetitive and mean-spirited, yet continued using the app normally. {target_name} stopped bringing physical notes to campus, isolated themselves during breaks, and walked away from conversations. A classmate who witnessed the original spill saw the sticker being used in their batch group."
            ),
            (
                "{target_name} was carrying experimental equipment across the engineering corridor for an afternoon lab in {academic_task}. An awkwardly shaped cardboard box slipped from their hands, tumbling loudly across the polished corridor floor. {initiator_name} took a photo of the scattered mess and posted it on {platform} with a derogatory caption questioning their capability. The picture received dozens of sarcastic comments, and students began referencing it in hallway conversations. A few classmates helped gather the items but did not challenge the post online. {target_name} stopped volunteering for lab demonstrations, walked with their head down, and left immediately after practicals. A lab assistant who witnessed the incident saw the photo trending in the campus chat."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about turning candid pictures of classmates into meme stickers without asking?",
                "options": [
                    {"text": "It is completely fine — memes are just student humor and nobody means any harm.", "score": 0},
                    {"text": "A bit annoying for the person, but it usually blows over in a few days.", "score": 1},
                    {"text": "It is wrong — making fun of a classmate's picture without their permission is hurtful.", "score": 2},
                    {"text": "It is completely unacceptable and disrespectful to turn a peer into a joke for cheap laughs.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would your circle of friends expect you to do when this meme appears in a chat?",
                "options": [
                    {"text": "Forward it with laughing emojis and tag other classmates.", "score": 0},
                    {"text": "Look at it without forwarding or commenting.", "score": 1},
                    {"text": "Refuse to share it and tell friends not to forward it.", "score": 2},
                    {"text": "Say clearly in the chat that making stickers out of classmates is not cool.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that speaking up against a meme can stop people from sharing it?",
                "options": [
                    {"text": "Not confident — once people find something funny, nobody listens if you complain.", "score": 0},
                    {"text": "Unsure — I might be called someone who can't take a joke.", "score": 1},
                    {"text": "Fairly confident — reminding friends that it hurts their feelings usually makes them stop.", "score": 2},
                    {"text": "Very confident — speaking up calmly reminds people of common decency and stops the trend.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do when this meme appears on {platform} or in WhatsApp?",
                "options": [
                    {"text": "Save the sticker to use in chats with other friends.", "score": 0},
                    {"text": "Look at the meme and ignore the conversation.", "score": 1},
                    {"text": "Don't share it, and send a private message to check on {target_name}.", "score": 2},
                    {"text": "Ask the person who made it to delete it, and let {target_name} know you support them.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If someone in your study circle wants to make a meme out of another student's photo, what will you say?",
                "options": [
                    {"text": "Help them come up with funny captions for it.", "score": 0},
                    {"text": "Stay quiet and let them do what they want.", "score": 1},
                    {"text": "Tell them privately that making memes of classmates is hurtful.", "score": 2},
                    {"text": "Tell them clearly not to do it because we shouldn't make fun of our own batch mates.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe that 'it was just a joke' makes it okay to hurt someone's feelings?",
                "options": [
                    {"text": "Yes — if nobody intended harm, the person shouldn't complain.", "score": 0},
                    {"text": "Mostly yes — people are sometimes too sensitive about jokes.", "score": 1},
                    {"text": "No — calling it a joke doesn't take away the embarrassment and hurt it causes.", "score": 2},
                    {"text": "Never — hiding behind 'it's just a joke' is an excuse that normalizes online teasing.", "score": 3},
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
                "{target_name} is an active student enrolled in your university academic department. An anonymous individual created a parody account on {platform} using {target_name}'s name, photo, and biographical details. The fake account began sharing fabricated quotes, absurd opinions, and disrespectful statements aimed at university professors. Within two days, dozens of classmates followed the account, leaving laughing comments and encouraging the impersonation. A few students recognized the potential disciplinary consequences but said nothing. {target_name} spent hours trying to report the account, stopped speaking in class, and avoided faculty offices entirely. A classmate who was followed by the parody account recognized {target_name}'s real profile photo."
            ),
            (
                "{target_name} is known in their batch as an enthusiastic participant in class discussions for {academic_task}. Someone created a spoof account on {platform} that exaggerated their speaking style and mocked their classroom questions. The creator posted satirical status updates pretending to represent {target_name}'s daily thoughts and academic opinions. Dozens of students from the section liked and commented on the posts, treating the account as regular entertainment. Some peers felt uncomfortable with the targeted harassment but remained silent. {target_name} stopped raising their hand in lectures, sat in the rear row, and deleted their own accounts. A student who was tagged by the spoof account saw the latest post notification."
            ),
            (
                "{target_name} recently ran as a candidate for Class Representative in their departmental section. An anonymous user set up a fake profile on {platform} that caricatured their campaign promises with humiliating memes. The account posted daily caricatures that attracted sarcastic comments and ridiculing remarks from batchmates. Several students shared the memes into unofficial section chats where discussions escalated unchecked. A small number of classmates found the personal attacks distasteful, yet none spoke up publicly. {target_name} formally withdrew their nomination, stopped attending batch meetings, and kept to themselves during breaks. A classmate who voted for {target_name} received a link to the spoof account from a mutual friend."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about making a fake account or parody profile of a student?",
                "options": [
                    {"text": "It is just funny campus drama; it's fun to watch.", "score": 0},
                    {"text": "Not very polite, but fake profiles happen on social media all the time.", "score": 1},
                    {"text": "It is completely wrong — making a fake profile can ruin someone's reputation.", "score": 2},
                    {"text": "It is an unacceptable and dangerous act of harassment that can cause severe harm to a student.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would good peers and teachers expect when a fake student account is discovered?",
                "options": [
                    {"text": "Most students follow the account to see what crazy thing it posts next.", "score": 0},
                    {"text": "People just watch silently until someone in authority notices.", "score": 1},
                    {"text": "Responsible students report the account immediately for impersonation.", "score": 2},
                    {"text": "Good peers alert {target_name} right away and collectively report the fake profile to get it banned.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can help {target_name} get a fake account removed on {platform}?",
                "options": [
                    {"text": "Not confident — social media platforms never respond to student reports.", "score": 0},
                    {"text": "A bit unsure — I wouldn't know the exact reporting steps.", "score": 1},
                    {"text": "Fairly confident — I can guide {target_name} on how to report impersonation with their student ID.", "score": 2},
                    {"text": "Very confident — I can report it, help {target_name} report it, and ask our batch to flag it too.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "If classmates mistakenly think the fake account is real, how confident are you that you can clear things up?",
                "options": [
                    {"text": "Not confident — once rumors start, people believe whatever they want.", "score": 0},
                    {"text": "A bit hesitant — explaining things might drag me into unwanted drama.", "score": 1},
                    {"text": "Fairly confident — I can tell our batch group that the account is fake.", "score": 2},
                    {"text": "Very confident — I can post an alert in our class groups to make sure everyone knows it's an imposter.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you do the moment you find this fake account on {platform}?",
                "options": [
                    {"text": "Follow the account and read its posts out of curiosity.", "score": 0},
                    {"text": "Do nothing and see how long it stays online.", "score": 1},
                    {"text": "Tell {target_name} right away so they know about it.", "score": 2},
                    {"text": "Alert {target_name}, report the account for impersonation, and tell friends not to follow it.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If the person who made the fake account is in your friend group, what will you tell them?",
                "options": [
                    {"text": "Laugh with them about how funny the fake posts are.", "score": 0},
                    {"text": "Stay quiet so I don't ruin my friendship with them.", "score": 1},
                    {"text": "Tell them privately that making fake profiles is dangerous and wrong.", "score": 2},
                    {"text": "Tell them firmly to delete the account and apologize to {target_name}, or I will report it.", "score": 3},
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
                "{target_name} and {initiator_name} are both enrolled in a major lecture course for {academic_task}. {target_name} posted a polite clarification question about tomorrow's assignment submission deadline in the 120-member {platform}. {initiator_name} responded publicly with a harsh, sarcastic insult calling the question foolish and questioning their intelligence. Several classmates chimed in with laughing emojis and mocking memes, while over eighty other members read the messages in silence. No one typed a message to defend {target_name} or answer the original deadline question. {target_name} stopped asking questions in group chats, did not attend office hours, and submitted their assignment unassisted. A classmate who also needed clarification on the same deadline read the entire exchange in the group."
            ),
            (
                "{target_name} is an undergraduate student who shared a helpful revision guide for {academic_task} in {platform}. Due to a minor typo on page three, one formula was mislabeled in the shared PDF document. {initiator_name} screenshotted the mistake and posted it with a ridiculing comment calling the entire guide useless garbage. A flurry of sarcastic remarks and laughing reactions followed from active members of the group. Many students who had downloaded the notes stayed quiet and did not offer any appreciation. {target_name} deleted the shared study guide, muted the batch chat, and stopped sharing academic materials with peers. A student who had found the first two pages very useful saw the ridicule unfold in real time."
            ),
            (
                "{target_name} inquired about the location of an upcoming laboratory session for {academic_task} in the official {platform}. Having missed an earlier announcement due to illness, they hoped a peer would provide the room number. {initiator_name} posted a sarcastic reply telling {target_name} to wake up and learn how to read announcements properly. Multiple students reacted with laughing stickers, turning the simple inquiry into a shared departmental joke. Several group administrators saw the rude remarks but took no moderating action. {target_name} arrived late to the laboratory session, sat at an empty bench, and avoided speaking to group members. A student who knew the correct room number had their phone open on the chat screen."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about making fun of a classmate who asks for academic help in a batch WhatsApp group?",
                "options": [
                    {"text": "It is normal banter; students should check lecture slides before asking silly questions.", "score": 0},
                    {"text": "A bit harsh, but people in big groups need to develop thick skin.", "score": 1},
                    {"text": "It is mean and unfair — it makes students scared to ask questions and seek help.", "score": 2},
                    {"text": "It is completely wrong — batch groups should be helpful, not places where students get ridiculed.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would most reasonable classmates think if you stepped in to answer {target_name}'s question?",
                "options": [
                    {"text": "They would think I am ruining the fun and being overly serious.", "score": 0},
                    {"text": "They wouldn't care either way — group chats move fast.", "score": 1},
                    {"text": "They would quietly appreciate someone being helpful in the chat.", "score": 2},
                    {"text": "They would respect me for breaking the silence and setting a polite tone in our batch group.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can change the mood in the group when people start teasing someone?",
                "options": [
                    {"text": "Not confident — speaking up usually makes the bullies start targeting you next.", "score": 0},
                    {"text": "A bit hesitant — I want to help, but I worry about sounding awkward in a big group.", "score": 1},
                    {"text": "Fairly confident — I can simply reply with the correct answer to shift focus away from the teasing.", "score": 2},
                    {"text": "Very confident — I can answer the question politely and remind everyone to keep the chat respectful.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do right after seeing this teasing in {platform}?",
                "options": [
                    {"text": "Add a laughing sticker or reaction to go with the flow.", "score": 0},
                    {"text": "Mute the group and ignore the messages.", "score": 1},
                    {"text": "Message {target_name} privately with the answer and tell them not to feel bad.", "score": 2},
                    {"text": "Reply in the group with the helpful answer, and say that making fun of questions is uncalled for.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If {target_name} left the group because they felt embarrassed, how would you respond?",
                "options": [
                    {"text": "Assume someone else will add them back if they really need updates.", "score": 0},
                    {"text": "Feel bad, but take no personal step to reach out.", "score": 1},
                    {"text": "Message them privately to share class notes and tell them what happened was unfair.", "score": 2},
                    {"text": "Contact the class CR or admin to add them back, and make sure they feel welcomed in the class.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe class WhatsApp groups should have clear rules against insulting classmates?",
                "options": [
                    {"text": "No — group chats are informal and shouldn't have strict rules.", "score": 0},
                    {"text": "Only if people use bad words, otherwise teasing is fine.", "score": 1},
                    {"text": "Yes — basic respect is important so all students can stay updated without fear.", "score": 2},
                    {"text": "Definitely — class groups should be safe study spaces where nobody gets bullied.", "score": 3},
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
                "{target_name} and {initiator_name} have been classmates and occasional study partners since their first academic year. During a difficult week, {target_name} sent a confidential direct message admitting they were struggling emotionally with {academic_task}. {initiator_name} took a screenshot of the vulnerable conversation and forwarded it into the active section {platform} without permission. Several students shared laughing emojis and joked about {target_name} being unable to cope with university pressure. A few group members felt the breach of trust was wrong, but said nothing in the thread. {target_name} left the section group immediately, blocked {initiator_name}, and stopped attending lectures for two days. A mutual friend who was present in the group received the forwarded screenshot."
            ),
            (
                "{target_name} reached out privately to a peer to discuss personal anxieties about failing their upcoming exam in {academic_task}. They admitted feeling overwhelmed by the coursework and asked for advice on speaking with a counselor. The recipient took screenshots of the candid chat and shared them into a large departmental {platform} with an unkind caption. Students in the chat began dissecting the private admission, leaving judgmental remarks and sarcastic reactions. Some readers were shocked by the leak but avoided confronting the person who posted it. {target_name} deactivated their messaging accounts, avoided common student lounges, and sat alone in the library. A classmate who also struggled with exam anxiety saw the private screenshot in the chat."
            ),
            (
                "{target_name} shared a personal voice note with a friend expressing frustration about an unfair group grading policy in {academic_task}. The voice note was recorded in confidence late at night from their hostel dorm room. The recipient forwarded the private recording into a general {platform} where forty classmates could listen to it. Group members quickly began quoting the voice note sarcastically, sharing laughing stickers and mocking the emotional tone. Several members realized the recording was confidential but remained completely silent. {target_name} stopped contributing to project discussions, kept their camera off during online calls, and missed the next briefing. A student who was listening to the voice note in the campus cafeteria saw {target_name} walk past."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about leaking someone's private emotional messages into a group chat?",
                "options": [
                    {"text": "People shouldn't write sensitive things digitally if they don't want them shared.", "score": 0},
                    {"text": "A breach of trust, but leaks in group chats are just part of university life.", "score": 1},
                    {"text": "It is completely wrong — sharing someone's personal struggles breaks trust and causes deep hurt.", "score": 2},
                    {"text": "It is a severe violation of privacy that is cruel and can deeply harm a person's mental health.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would your closest peers expect you to do when a leaked screenshot is shared in a chat?",
                "options": [
                    {"text": "They would expect me to forward it to other friends for gossip.", "score": 0},
                    {"text": "They would expect me to stay quiet and read without getting involved.", "score": 1},
                    {"text": "They would expect me not to forward it and to delete the image.", "score": 2},
                    {"text": "They would expect me to tell the person who sent it that leaking private chats is wrong and must stop.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can help stop a leaked private message from spreading further?",
                "options": [
                    {"text": "Not confident — once something is forwarded on WhatsApp, you cannot stop it.", "score": 0},
                    {"text": "Doubtful — asking people to delete things often makes them more curious.", "score": 1},
                    {"text": "Fairly confident — I can tell friends in my chats to delete the screenshot and stop sharing it.", "score": 2},
                    {"text": "Very confident — I can tell the sender it's wrong, alert {target_name}, and ask group admins to delete the message.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you received this leaked screenshot in a group chat?",
                "options": [
                    {"text": "Forward it to my close friends to discuss the gossip.", "score": 0},
                    {"text": "Look at the screenshot and close the chat without doing anything.", "score": 1},
                    {"text": "Do not forward it, delete it, and privately let {target_name} know about the leak.", "score": 2},
                    {"text": "Say in the chat that sharing private messages is wrong, and message {target_name} to offer support.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If a close friend of yours is forwarding the screenshot, what will you tell them?",
                "options": [
                    {"text": "Ask them if there is any more news or gossip about it.", "score": 0},
                    {"text": "Say nothing so I don't create awkwardness between us.", "score": 1},
                    {"text": "Ask them quietly to delete it because it isn't right to spread someone's personal struggles.", "score": 2},
                    {"text": "Tell them firmly that leaking private chats is hurtful and urge them to delete it everywhere.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe that respecting privacy in student chats is a basic rule everyone should follow?",
                "options": [
                    {"text": "No — group chats are casual and nobody should expect true privacy.", "score": 0},
                    {"text": "Only in formal groups, but in casual chats people share whatever they want.", "score": 1},
                    {"text": "Yes — basic decency means you never share someone's private words without asking.", "score": 2},
                    {"text": "Definitely — keeping personal conversations private is essential for trust among students.", "score": 3},
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
                "{target_name} and {initiator_name} are classmates who use a departmental {platform} server for coursework collaboration. During an active study voice channel session for {academic_task}, an argument broke out over code structure. {initiator_name} and two moderators repeatedly muted {target_name}, stripped their server roles, and posted mocking memes in general text. Other students in the channel watched the targeted exclusion happen without challenging the moderators' behavior. A few members sent laughing emojis whenever {target_name} attempted to rejoin the channel. {target_name} eventually left the server permanently, stopped collaborating with classmates, and worked entirely alone on the project. A student who had the same permissions as the moderators remained connected in the voice call."
            ),
            (
                "{target_name} joined a student-run {platform} server dedicated to exam preparation and peer tutoring for {academic_task}. When they asked for assistance understanding an advanced topic, {initiator_name} publicly stated that the server was only for competent students. The server admins placed {target_name} on a permanent timeout, preventing them from accessing shared past papers and notes. Multiple members observed the restriction in the logs, but nobody objected to the unfair treatment. Some students privately downloaded the materials for themselves while ignoring the ban. {target_name} stopped seeking peer help, struggled through the syllabus alone, and appeared visibly isolated in classes. A classmate who had access to the restricted study files was actively browsing the channel."
            ),
            (
                "{target_name} was an active participant in a university gaming and academic community hosted on {platform}. Following a minor disagreement regarding scheduling a study session for {academic_task}, {initiator_name} launched an exclusion campaign. They created private channels excluding {target_name} and encouraged other members to ignore {target_name}'s messages in the public lounge. Peers gradually stopped responding to {target_name}'s posts, following the social pressure created by the core group. A few individual members felt uncomfortable with the cold shoulder but complied quietly. {target_name} sent fewer messages each day until stopping completely, abandoning both the games and the study group. A server member who was invited to the secret private channel had not replied yet."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about using server moderator powers to mute and tease a classmate?",
                "options": [
                    {"text": "Server owners can do whatever they want; it is not a big deal.", "score": 0},
                    {"text": "A bit childish, but Discord and gaming servers always have some toxic banter.", "score": 1},
                    {"text": "It is unfair and mean — using admin tools to silence a classmate is online bullying.", "score": 2},
                    {"text": "It is completely unacceptable abuse of power that unfairly excludes a student from studying.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would fair classmates in the server expect from others when someone is being bullied like this?",
                "options": [
                    {"text": "They expect people to laugh along so they don't get kicked out too.", "score": 0},
                    {"text": "They expect people to leave the voice call quietly and mind their business.", "score": 1},
                    {"text": "They would respect anyone who un-mutes {target_name} or speaks up against the unfairness.", "score": 2},
                    {"text": "They expect responsible members to tell the moderators that treating classmates like this is wrong.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can speak up when server moderators are the ones teasing someone?",
                "options": [
                    {"text": "Not confident — arguing with moderators means you will get banned or kicked out next.", "score": 0},
                    {"text": "Unsure — I would feel powerless against people who have admin permissions.", "score": 1},
                    {"text": "Fairly confident — I can leave the channel with {target_name} and study together in a separate call.", "score": 2},
                    {"text": "Very confident — I can object in chat, support {target_name}, and create an open study space for everyone.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you were in the call when {target_name} was muted and teased?",
                "options": [
                    {"text": "Laugh along in chat and stay in the call to fit in with the group.", "score": 0},
                    {"text": "Stay silent and wait until the argument ends.", "score": 1},
                    {"text": "Leave the call, message {target_name} privately, and offer to study together separately.", "score": 2},
                    {"text": "Speak up in the call to tell the moderators to stop, and make sure {target_name} is included.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If this server is the main place where study materials for {academic_task} are shared, how will you help {target_name}?",
                "options": [
                    {"text": "Assume they can find study resources on their own.", "score": 0},
                    {"text": "Feel bad, but avoid sharing materials to stay on good terms with the server mods.", "score": 1},
                    {"text": "Privately forward all important notes, assignments, and announcements to {target_name}.", "score": 2},
                    {"text": "Share all study files with {target_name} and ask the class CR to ensure all study links are shared publicly.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you think study groups and servers should be welcoming and open to all classmates?",
                "options": [
                    {"text": "No — student groups are private and owners can exclude whoever they don't like.", "score": 0},
                    {"text": "Only if teachers are watching, otherwise anything goes.", "score": 1},
                    {"text": "Yes — when students study together online, everyone deserves respect and equal access.", "score": 2},
                    {"text": "Definitely — isolating a student from academic study groups is unfair and harms their education.", "score": 3},
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
                "{target_name} is a dedicated student working alongside {initiator_name} and others on a semester assignment for {academic_task}. When {target_name} took a day off due to a documented family emergency, {initiator_name} created a secret backchannel group on {platform}. They spread false rumors claiming {target_name} was intentionally skipping work and faking personal problems to avoid contributing. The gossip spread across multiple project teams, and classmates began treating {target_name} with noticeable suspicion. Several peers knew {target_name}'s family situation was genuine, yet kept quiet to avoid group friction. {target_name} noticed the sudden coldness, stopped attending informal group lunches, and completed their project deliverables in isolation. A group partner who received the secret backchannel link had not added any comments."
            ),
            (
                "{target_name} achieved the top score in a difficult midterm examination for {academic_task}. Shortly after the grades were posted, {initiator_name} initiated a private rumor thread on {platform} alleging academic dishonesty. They claimed without evidence that {target_name} had obtained the answer key from an instructor beforehand. The rumor gained momentum as students forwarded the claims to friends across different sections. Some classmates knew {target_name} had studied for weeks in the library, but chose not to defend them. {target_name} stopped celebrating their achievement, avoided faculty mentors, and sat away from classmates in subsequent lectures. A student who had studied alongside {target_name} for the exam saw the rumor message forwarded into their chat."
            ),
            (
                "{target_name} was nominated by their department to represent the university in an intercollegiate competition for {academic_task}. Unsatisfied with the decision, {initiator_name} set up a side chat on {platform} to circulate derogatory gossip about {target_name}'s character. They claimed {target_name} had badmouthed other team members during the selection interviews. Peers in the department began giving {target_name} cold stares and excluding them from collaborative study tables. A handful of students recognized the malicious intent of the gossip, but stayed passive. {target_name} felt deeply alienated, withdrew from the competition team, and attended classes with minimal interaction. A student who was present during the selection interviews was added to the gossip group."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about making secret side groups to talk behind a classmate's back and exclude them?",
                "options": [
                    {"text": "People have the right to talk with whoever they want; venting about classmates is completely normal.", "score": 0},
                    {"text": "A little mean, but private gossip doesn't hurt anyone as long as the person doesn't find out.", "score": 1},
                    {"text": "It is toxic and unfair — creating secret groups to exclude someone ruins trust in the class.", "score": 2},
                    {"text": "It is completely wrong and cowardly bullying that isolates a person and damages class unity.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would honest classmates expect you to do if you were added to such a gossip chat?",
                "options": [
                    {"text": "They would expect me to stay in the group and enjoy the gossip.", "score": 0},
                    {"text": "They would expect me to stay quietly without saying anything.", "score": 1},
                    {"text": "They would expect me to leave the group and say that I don't want to be part of gossiping.", "score": 2},
                    {"text": "They would expect me to say gossiping is wrong, exit the group, and make sure {target_name} isn't being sabotaged.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can leave a gossip group even if it might make you unpopular?",
                "options": [
                    {"text": "Not confident — leaving might make them turn around and start gossiping about me next.", "score": 0},
                    {"text": "Unsure — I would worry about missing out on class updates and friend circles.", "score": 1},
                    {"text": "Fairly confident — I care more about doing the right thing than being in a mean chat.", "score": 2},
                    {"text": "Very confident — I can leave without hesitation, explain my reason politely, and encourage others to leave too.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you were added to a secret chat created just to make fun of {target_name}?",
                "options": [
                    {"text": "Stay in the group to see what everyone is saying and stay in the loop.", "score": 0},
                    {"text": "Mute the notifications and stay in the group quietly.", "score": 1},
                    {"text": "Leave the group and make sure I treat {target_name} with kindness in person.", "score": 2},
                    {"text": "Say that talking behind someone's back is wrong, exit the group, and check in on {target_name}.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If you see members from the secret group giving {target_name} the cold shoulder in class, what will you do?",
                "options": [
                    {"text": "Join in ignoring {target_name} so I don't stand out from the group.", "score": 0},
                    {"text": "Keep to myself and stay out of the social drama.", "score": 1},
                    {"text": "Sit next to {target_name} and talk with them so they don't feel left out.", "score": 2},
                    {"text": "Make sure {target_name} is included in discussions, and tell group members to stop acting childish.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe that 'what someone doesn't know can't hurt them' applies to secret bullying groups?",
                "options": [
                    {"text": "Yes — if {target_name} never sees the chat, no real harm is done.", "score": 0},
                    {"text": "Mostly yes, though it can create some awkwardness in class.", "score": 1},
                    {"text": "No — secret gossip always leaks into how people treat each other in real life.", "score": 2},
                    {"text": "Definitely not — talking behind someone's back leads to real exclusion and deeply hurts people.", "score": 3},
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
                "{target_name} sent an earnest voice note in {platform} trying to clarify the submission requirements for {academic_task}. Because they were speaking in a hurry between classes, their accent sounded different and their phrasing was somewhat rushed. {initiator_name} clipped the recording, adjusted the pitch to make it sound ridiculous, and posted it back into the group. Dozens of students reacted with laughing emojis and began repeating the distorted phrases as inside jokes. Several members realized the mockery was disrespectful, but no one asked {initiator_name} to delete the clip. {target_name} stopped sending voice notes, kept their typed messages to a bare minimum, and left class early. A classmate who had been confused by the same requirements listened to the audio clip on their phone."
            ),
            (
                "{target_name} was practicing pronunciation and presentation pacing for an oral assessment in {academic_task}. They shared a short voice recording in a peer review {platform} asking for constructive feedback on their tone. {initiator_name} forwarded the recording to an unofficial batch channel, adding mocking captions that ridiculed their voice. Classmates started creating audio remixes and sharing them across peer networks with laughing reactions. A few students thought the parody was unnecessarily cruel, but joined the collective laughter to fit in. {target_name} did not submit the optional practice recording and spoke quietly during the actual assessment. A student who originally promised to give constructive feedback saw the remix circulating in another chat."
            ),
            (
                "{target_name} left a concerned voice note in the project {platform} explaining that they were stuck in heavy traffic during a storm. They worried about missing the group submission deadline for {academic_task} and apologized profusely to their teammates. {initiator_name} shared the audio clip into a larger social group, mocking {target_name}'s panicked tone and anxious breathing. Multiple students laughed at the emotional reaction, turning someone's stressful ordeal into casual entertainment. Some group partners knew how hard {target_name} had worked on the report, but said nothing in their defense. {target_name} arrived soaked at the department, submitted their section silently, and avoided speaking to teammates afterward. A teammate who was standing near the project submission desk saw the forwarded audio notification."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about forwarding someone's voice note to make fun of their accent or pronunciation?",
                "options": [
                    {"text": "It is just casual humor; people tease accents in university all the time.", "score": 0},
                    {"text": "A little insensitive, but students shouldn't take accent jokes too seriously.", "score": 1},
                    {"text": "It is mean and hurtful — making fun of someone's accent or background makes them feel insecure.", "score": 2},
                    {"text": "It is completely unacceptable bullying that silences students and makes them afraid to speak up.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do educated and respectful university students think of making fun of regional accents?",
                "options": [
                    {"text": "They laugh along because accent jokes are common among students.", "score": 0},
                    {"text": "They ignore it as harmless campus banter.", "score": 1},
                    {"text": "They view it as immature and disrespectful toward fellow classmates.", "score": 2},
                    {"text": "They strongly condemn it and believe every student's background should be respected.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can defend someone whose voice note is being mocked?",
                "options": [
                    {"text": "Not confident — calling out accent teasing makes people say you have no sense of humor.", "score": 0},
                    {"text": "Unsure — I wouldn't know how to address it without starting an argument.", "score": 1},
                    {"text": "Fairly confident — I can remind the group that accents are natural and the idea itself was good.", "score": 2},
                    {"text": "Very confident — I can clearly tell the group that mocking accents is wrong and support {target_name}.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do upon seeing {target_name}'s voice note forwarded and teased?",
                "options": [
                    {"text": "Listen to it and smile at the funny imitation voice notes.", "score": 0},
                    {"text": "Listen to it but stay quiet to stay out of the issue.", "score": 1},
                    {"text": "Send a message in the chat saying {target_name}'s point was good and we should focus on the work.", "score": 2},
                    {"text": "Tell {initiator_name} that mocking accents is wrong, and message {target_name} to reassure them.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "How will you encourage classmates who feel shy about speaking in group chats in the future?",
                "options": [
                    {"text": "Tell them to type messages instead of sending voice notes so they avoid teasing.", "score": 0},
                    {"text": "Don't think about it — students need to get over their own shyness.", "score": 1},
                    {"text": "Listen carefully, reply positively to their ideas, and appreciate their contributions.", "score": 2},
                    {"text": "Make sure our study groups have a welcoming environment where everyone feels safe to speak.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe that making fun of how a student speaks stops them from participating in class?",
                "options": [
                    {"text": "No — if someone studies hard, teasing has no impact on their learning.", "score": 0},
                    {"text": "Only a little bit, if the student is unusually shy.", "score": 1},
                    {"text": "Yes — fear of being laughed at makes students stop asking questions and stay silent.", "score": 2},
                    {"text": "Definitely — mocking how someone speaks shatters their confidence and damages their education.", "score": 3},
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
                "{target_name} posted a personal opinion about an ethical case study for {academic_task} in {platform}. Their perspective differed from the mainstream consensus in the student section. {initiator_name} disagreed aggressively and began repeatedly tagging {target_name} in dozens of hostile messages over several hours. Other students joined the pile-on, tagging {target_name} with dismissive memes and demanding they admit they were wrong. Many silent group members saw their notifications flood with the argument, but chose not to step in. {target_name} muted the group chat, stopped participating in class debates, and looked noticeably anxious during subsequent seminars. A classmate who agreed with {target_name}'s original perspective was watching the notifications accumulate."
            ),
            (
                "{target_name} made a simple scheduling suggestion for a makeup class in {academic_task} on the section {platform}. {initiator_name} felt the suggestion was inconvenient and started a continuous barrage of sarcastic messages tagging {target_name}. They encouraged ten other students to tag {target_name} simultaneously with spam reactions until the screen was filled. The targeted student's phone was overloaded with notifications during an ongoing lecture. Several classmates watched the spamming unfold on their screens and smiled, while others ignored the disruption. {target_name} switched their phone off, left the lecture room during the break, and did not return that afternoon. A student sitting next to {target_name} saw their screen vibrating constantly from the repeated tags."
            ),
            (
                "{target_name} reminded the class group on {platform} that assignments for {academic_task} had to follow strict anti-plagiarism guidelines. {initiator_name} accused {target_name} of acting like a strict teacher and began tagging them with sarcastic nicknames. Throughout the evening, multiple classmates tagged {target_name} in hostile memes, telling them to mind their own business. The constant pinging made it impossible for {target_name} to use the group for academic purposes. Some students felt the response was disproportionate, but kept their opinions to themselves. {target_name} left the group, stopped sharing assignment reminders, and studied entirely on their own. A class representative who had administrative privileges in the group read through the harassment thread."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about spam-tagging and publicly calling out a classmate in a large group chat?",
                "options": [
                    {"text": "It is necessary — if someone is late or makes a mistake, public pressure gets the work done.", "score": 0},
                    {"text": "A bit annoying, but when project deadlines approach people get stressed and vent.", "score": 1},
                    {"text": "It is unfair and mean — problems should be solved privately, not through humiliating public spam.", "score": 2},
                    {"text": "It is completely wrong — gang-up tagging is public harassment that causes intense stress and embarrassment.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do mature classmates expect when someone starts spamming and calling out a peer in the group?",
                "options": [
                    {"text": "Most students find it funny and join in tagging the person as well.", "score": 0},
                    {"text": "People mute the chat and ignore the flood of messages.", "score": 1},
                    {"text": "Responsible students expect someone to message: 'Please discuss this in private DMs.'", "score": 2},
                    {"text": "Good peers expect members to tell {initiator_name} to stop the spam and handle issues respectfully.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that sending a calm message in the group can stop mass-tagging?",
                "options": [
                    {"text": "Not confident — angry students will just start tagging and attacking me too.", "score": 0},
                    {"text": "Unsure — it is hard to stop people once a group spam trend starts.", "score": 1},
                    {"text": "Fairly confident — a calm message reminding people to talk in private usually cools down the chat.", "score": 2},
                    {"text": "Very confident — I can say clearly in the chat to stop, and ask the group admin to mute the spammer.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do while watching {target_name} get spam-tagged and insulted?",
                "options": [
                    {"text": "Tag {target_name} once as well just to be funny.", "score": 0},
                    {"text": "Mute the group and wait for the spam to quiet down.", "score": 1},
                    {"text": "Send a message in the chat: 'Please discuss this privately, no need to spam the group.'", "score": 2},
                    {"text": "Call out the spam in the group, ask the admin to step in, and message {target_name} to check on them.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If you are leading a group project in the future and a teammate falls behind, how will you handle it?",
                "options": [
                    {"text": "Call them out in the batch group so everyone knows they didn't contribute.", "score": 0},
                    {"text": "Ignore them and do all the work myself while staying angry.", "score": 1},
                    {"text": "Talk to them privately, understand what happened, and agree on a realistic deadline.", "score": 2},
                    {"text": "Talk to them with empathy, help them catch up, and solve issues respectfully without public shaming.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe publicly embarrassing a classmate ever produces good teamwork or results?",
                "options": [
                    {"text": "Yes — fear of public embarrassment is the only way to get lazy students to work.", "score": 0},
                    {"text": "Sometimes — strict pressure produces results in tough situations.", "score": 1},
                    {"text": "No — embarrassing someone only causes anger, panic, and stops genuine cooperation.", "score": 2},
                    {"text": "Definitely not — public shaming destroys trust, hurts self-worth, and ruins team collaboration.", "score": 3},
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
                "{target_name} and {initiator_name} were assigned to the same four-person group project for {academic_task}. A few days before the final deadline, {initiator_name} edited the shared document and removed {target_name}'s name from the report. They posted in {platform} claiming {target_name} had contributed zero effort, despite {target_name} completing their assigned research sections. The other two group members watched the credit being stripped away but remained silent to protect their own grades. Peers from other teams heard about the dispute and assumed {target_name} was an unreliable partner. {target_name} discovered the erasure on the morning of submission, broke down quietly in the hallway, and did not enter the classroom. One group member who had reviewed {target_name}'s original drafts was standing by the submission counter."
            ),
            (
                "{target_name} was assigned as a partner alongside {initiator_name} for a critical semester project in {academic_task}. {initiator_name} deliberately changed the access permissions on the shared repository and cloud folder, locking {target_name} out. They announced in the class forum that {target_name} was unresponsive and asked the professor to reassign the work. Classmates who had seen {target_name} working diligently on campus did not step forward to set the record straight. Several peers sided with {initiator_name} simply because they were more popular in the batch. {target_name} attended the project presentation in silence, unable to present, and received a failing provisional mark. A classmate who shared a computer lab table with {target_name} while they coded the project was present in the room."
            ),
            (
                "{target_name} worked for three weeks compiling data for a complex collaborative study in {academic_task}. During a late-night editing session, {initiator_name} replaced {target_name}'s comprehensive analysis with their own summary. When {target_name} protested in {platform}, {initiator_name} told the entire group that {target_name}'s work was substandard and useless. Other teammates agreed with {initiator_name} to avoid conflict and finish the project quickly. Nobody validated the hours of effort {target_name} had invested into the data collection. {target_name} left the team workspace, did not attend the final debrief, and requested an individual meeting with the department head. A teammate who knew the analysis was accurate had not sent any message to the group."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about removing a group member's name and work right before a deadline without telling them?",
                "options": [
                    {"text": "Leaders have to make tough decisions; if someone wasn't fast enough, they deserve it.", "score": 0},
                    {"text": "A bit harsh, but group projects are competitive and everyone must look out for their own grade.", "score": 1},
                    {"text": "It is completely unfair and dishonest — cutting someone off without discussion is academic sabotage.", "score": 2},
                    {"text": "It is an intolerable act of dishonesty and bullying that steals someone's hard work and damages their future.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What would fair and honest group members expect when someone tries to drop a teammate without warning?",
                "options": [
                    {"text": "They would stay quiet so their own marks aren't put at risk.", "score": 0},
                    {"text": "They would prefer to stay neutral and let the team leader make the call.", "score": 1},
                    {"text": "They would expect members to stand up for fairness and give the teammate their rightful credit.", "score": 2},
                    {"text": "They would refuse to submit the project until {target_name}'s legitimate work is included.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can stand up to a dominant group leader who is treating a teammate unfairly?",
                "options": [
                    {"text": "Not confident — challenging the leader might put my own project marks at risk.", "score": 0},
                    {"text": "A bit hesitant — I would feel uncomfortable arguing with someone who is bossy.", "score": 1},
                    {"text": "Fairly confident — I can show the document history and proof of {target_name}'s work to ensure fairness.", "score": 2},
                    {"text": "Fully confident — I can speak up in the group, show proof to the teacher if needed, and defend {target_name}.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you were on this project team?",
                "options": [
                    {"text": "Keep quiet, submit with the leader, and take my good grade.", "score": 0},
                    {"text": "Feel uncomfortable, but avoid speaking up to prevent group conflict before the deadline.", "score": 1},
                    {"text": "Tell {initiator_name} privately that dropping {target_name} is wrong and urge them to put their name back.", "score": 2},
                    {"text": "Clearly tell the team that I will not submit unless {target_name}'s work is included, and inform the teacher if needed.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If {target_name} is in distress and panicking about failing the course, how will you support them?",
                "options": [
                    {"text": "Tell them that that's how university life is and to retake the course next semester.", "score": 0},
                    {"text": "Feel sorry for them, but tell them I can't get involved because my own marks are on the line.", "score": 1},
                    {"text": "Give them copies and timestamps of their work so they can prove their contributions to the professor.", "score": 2},
                    {"text": "Go with them to the professor's office and confirm that they did their share of the project work.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe taking credit for a teammate's work or deleting their name is a form of cheating?",
                "options": [
                    {"text": "No — group work is about whatever team members agree to submit.", "score": 0},
                    {"text": "Not cheating, just a messy group disagreement.", "score": 1},
                    {"text": "Yes — taking credit for someone else's effort is dishonest and unfair.", "score": 2},
                    {"text": "Definitely — academic honesty means giving full credit to everyone who contributed to the work.", "score": 3},
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
                "{target_name} is a university resident living in the on-campus hostel while completing their degree in {academic_task}. During midterms, {initiator_name} secretly took photos of {target_name}'s side of the dorm room and posted them to {platform}. They added mocking captions criticizing {target_name}'s personal belongings, laundry, and modest background. Other hostel residents jumped into the comment thread, posting laughing emojis and creating hurtful inside jokes. Several students on the same floor felt the post violated basic privacy, but avoided getting involved. {target_name} stopped using the hostel common room, took meals in their room alone, and asked the warden for a room transfer. A resident living across the hall heard the laughter echoing down the corridor while viewing the post."
            ),
            (
                "{target_name} had a private phone conversation with their family late in the evening from their hostel room balcony. {initiator_name} secretly recorded part of the emotional conversation and shared the audio file in the hostel {platform}. The clip was circulated among wing residents with mocking captions about {target_name} being homesick and immature. Dozens of residents listened and shared sarcastic comments, turning a private moment into hostel gossip. A few residents felt deeply uneasy about the recording, but stayed silent to maintain group harmony. {target_name} stopped spending time on the balcony, avoided speaking to hallmates, and stayed in the library until closing hours. A student whose room shared the same balcony wall had heard the recording being made."
            ),
            (
                "{target_name} was studying late at night in the hostel common study hall for an upcoming exam in {academic_task}. Exhausted from revision, they fell asleep at the desk with their study notes scattered around them. {initiator_name} took pictures from multiple angles, drew insulting doodles over the photos, and posted them in the hostel chat on {platform}. Residents responded with laughing stickers and shared the photos into departmental channels by morning. Several students saw {target_name} sleeping peacefully and knew how hard they worked, yet did not intervene. {target_name} woke up to find classmates whispering, packed their books hurriedly, and left the study hall without breakfast. A resident who had been studying at the neighboring table saw the photos appear in their notifications."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about taking photos of a roommate sleeping and posting them in a hostel group chat?",
                "options": [
                    {"text": "It is normal hostel culture; everyone who lives in a dorm gets roasted.", "score": 0},
                    {"text": "A bit invasive, but room teasing is part of shared student living.", "score": 1},
                    {"text": "It is a serious violation of privacy that makes someone feel unsafe in their own room.", "score": 2},
                    {"text": "It is completely unacceptable — everyone deserves to feel safe and respected where they sleep.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do sensible hostel residents expect when people start making fun of a roommate in the floor chat?",
                "options": [
                    {"text": "They expect people to laugh along so they don't get targeted next.", "score": 0},
                    {"text": "They expect people to stay silent and mind their own business.", "score": 1},
                    {"text": "Sensible residents quietly disapprove and respect peers who refuse to join in.", "score": 2},
                    {"text": "They respect anyone who has the courage to say that targeting roommates crosses the line.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can speak up for a roommate without making your own hostel life difficult?",
                "options": [
                    {"text": "Not confident — creating friction on your own hostel floor makes people turn against you.", "score": 0},
                    {"text": "Unsure — I would worry that residents would start teasing me instead.", "score": 1},
                    {"text": "Fairly confident — I can calmly tell the group that taking photos of sleeping roommates is wrong.", "score": 2},
                    {"text": "Very confident — I can speak up in the chat, support {target_name}, and report repeated harassment to the hostel warden.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do upon seeing these mocking late-night messages on {platform}?",
                "options": [
                    {"text": "Mute the chat and check the gossip in the morning with curiosity.", "score": 0},
                    {"text": "Read the messages in silence and avoid taking any side.", "score": 1},
                    {"text": "Send a brief message in the group: 'Taking photos of people sleeping is not okay, please delete.'", "score": 2},
                    {"text": "Demand the photos be deleted immediately, tell {initiator_name} this is wrong, and check on {target_name}.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If {target_name} learns about the chat the next morning and is visibly upset, how will you respond?",
                "options": [
                    {"text": "Avoid eye contact and pretend I know nothing about what happened.", "score": 0},
                    {"text": "Tell them to ignore it because hostel guys always joke around like that.", "score": 1},
                    {"text": "Talk with them privately, reassure them, and let them know not everyone agrees with the bullies.", "score": 2},
                    {"text": "Stand by them, help them speak with the hostel warden if needed, and make sure they feel safe.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe a student's hostel room should be a safe space protected from online teasing?",
                "options": [
                    {"text": "No — once you share a room or dorm, you give up your right to privacy.", "score": 0},
                    {"text": "It depends on how close you are with your roommates.", "score": 1},
                    {"text": "Yes — everyone deserves a safe place where they can rest without fear of being filmed.", "score": 2},
                    {"text": "Definitely — a student's living space must always be respected, and violating it is never acceptable.", "score": 3},
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
                "{target_name} was elected as an executive member of a university student society related to {academic_task}. Unhappy with the election outcome, {initiator_name} launched an anonymous smear campaign on {platform}. They posted fabricated claims that {target_name} had mishandled society funds and engaged in favoritism during recruitment. The posts circulated quickly among society members, attracting suspicious comments and demands for an investigation. Senior society members knew the budget was thoroughly audited, but refrained from making a public statement. {target_name} resigned from their executive role, stopped attending society events, and became noticeably withdrawn on campus. A society treasurer who had verified all the financial receipts read the allegations online."
            ),
            (
                "{target_name} organized an annual academic workshop for {academic_task} that received praise from faculty members. {initiator_name} posted on {platform} claiming {target_name} took all the credit while forcing junior volunteers to do all the work. They tagged several faculty advisors and student leaders, inviting public criticism of {target_name}'s leadership. Classmates began debating the allegations publicly, with several people assuming the worst without verifying the facts. Junior volunteers who had enjoyed working with {target_name} hesitated to speak out against senior students. {target_name} cancelled their plans to organize the next symposium and declined further student leadership opportunities. A volunteer who worked directly alongside {target_name} throughout the event saw the post."
            ),
            (
                "{target_name} was chosen to lead the university debate delegation for an intercollegiate championship in {academic_task}. {initiator_name} created an anonymous poll on {platform} asking whether {target_name} was the least qualified leader in university history. The poll attracted hundreds of votes from students who enjoyed campus drama, generating a stream of ridiculing comments. Debate team members saw the damage being done to team morale, but feared becoming the next target. A few faculty advisors heard about the poll but dismissed it as harmless student politics. {target_name} stepped down as delegation head, stopped attending debate practices, and kept a low profile. A team member who had prepared their opening arguments with {target_name} had the poll on their screen."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about spreading fake rumors about a classmate during student society elections?",
                "options": [
                    {"text": "All is fair in elections — spreading rumors is just part of campus politics and competition.", "score": 0},
                    {"text": "A dirty tactic, but anyone running for a post should expect personal attacks.", "score": 1},
                    {"text": "It is dishonest and wrong — making up false rumors to win damages someone's character unfairly.", "score": 2},
                    {"text": "It is completely unacceptable behavior that ruins student trust and deeply harms an innocent person.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do honest student leaders and teachers expect when rumors circulate during campus elections?",
                "options": [
                    {"text": "Most students forward the gossip to see who wins.", "score": 0},
                    {"text": "People watch silently and wait for the election to pass.", "score": 1},
                    {"text": "Responsible students ask for proof before believing or forwarding anonymous claims.", "score": 2},
                    {"text": "Good student leaders expect peers to report fake rumors and reject negative campaigning.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can help stop false rumors spread in batch WhatsApp groups?",
                "options": [
                    {"text": "Not confident — once a rumor starts on WhatsApp, students believe it without questioning.", "score": 0},
                    {"text": "Unsure — getting involved in campus politics might make people target me too.", "score": 1},
                    {"text": "Fairly confident — I can ask the group for proof and point out that anonymous rumors shouldn't be trusted.", "score": 2},
                    {"text": "Very confident — I can challenge the rumors openly, urge classmates not to spread them, and support {target_name}.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do when you receive an unverified rumor attacking {target_name}?",
                "options": [
                    {"text": "Forward it to other friends to keep them updated on the drama.", "score": 0},
                    {"text": "Read the message and stay quiet without checking if it's true.", "score": 1},
                    {"text": "Refuse to forward it, and ask the sender if they have any actual proof.", "score": 2},
                    {"text": "Tell the group that spreading unverified rumors is wrong, and let {target_name} know so they can clear their name.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If the teacher in charge is considering dropping {target_name} due to the rumors, what will you do?",
                "options": [
                    {"text": "Stay out of teacher matters entirely to protect my own position.", "score": 0},
                    {"text": "Feel bad for {target_name}, but assume the truth will come out eventually.", "score": 1},
                    {"text": "Encourage {target_name} to meet the teacher and explain the truth with facts.", "score": 2},
                    {"text": "Go with {target_name} to the teacher to confirm that the rumors were fabricated by rivals.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe winning a student election is ever worth destroying a classmate's reputation?",
                "options": [
                    {"text": "Yes — winning is what matters most, and politics is always tough.", "score": 0},
                    {"text": "Sometimes — if the other candidate is bad, any tactic is acceptable.", "score": 1},
                    {"text": "No — no student society title is worth ruining a classmate's honor and peace of mind.", "score": 2},
                    {"text": "Never — spreading lies to win an election corrupts the entire university community.", "score": 3},
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
                "{target_name} posted a detailed, thoughtful answer to an online discussion prompt on the university LMS for {academic_task}. They offered a unique interpretation of the assigned reading that challenged conventional assumptions. {initiator_name} posted a condescending reply, then rallied several friends in {platform} to flood the LMS thread with hostile critiques. Within an hour, ten students posted coordinated replies belittling {target_name}'s academic reasoning and writing style. Other students enrolled in the course noticed the aggressive brigading, but avoided contributing to the discussion. {target_name} deleted their original response, never posted on the LMS forum again, and refrained from answering questions in lectures. A classmate who found {target_name}'s perspective insightful was reading through the hostile replies."
            ),
            (
                "{target_name} submitted a code review question on the official university learning portal for {academic_task}. They highlighted a bug they encountered in the sample code provided for an upcoming lab assignment. {initiator_name} took screenshots of the question and posted them on {platform}, calling {target_name} incompetent. They encouraged classmates to downvote the question on the portal and leave sarcastic comments under the post. The professor had not yet reviewed the thread, and peers watched the downvotes multiply in real time. {target_name} withdrew the question, struggled with the lab assignment alone, and submitted an incomplete project. A student who had encountered the exact same bug in their code saw the question being mocked."
            ),
            (
                "{target_name} shared a link to an open-source tutorial on the course discussion board for {academic_task} to help struggling peers. {initiator_name} commented that only lazy students need external tutorials and accused {target_name} of promoting shortcuts. They mobilized their friend circle on {platform} to spam the discussion board with sarcastic memes and dismissive remarks. The helpful tutorial thread was buried under negative comments, discouraging other students from using the resource. Several classmates who had bookmarked the link remained silent throughout the public mockery. {target_name} stopped participating in course forums, kept their study materials private, and worked in isolation. A student who was currently reading the tutorial to prepare for an exam saw the spam comments arrive."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about leaving rude comments and mocking a classmate on official university LMS forums?",
                "options": [
                    {"text": "Students who post too much on LMS deserve pushback for trying to show off to teachers.", "score": 0},
                    {"text": "A bit immature, but forum arguments happen in every university course.", "score": 1},
                    {"text": "It is completely wrong — using official study portals to make fun of someone ruins the learning space.", "score": 2},
                    {"text": "It is unacceptable bullying that discourages students from asking questions and participating in class.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do professors and serious university students expect when peers post on course discussion boards?",
                "options": [
                    {"text": "They expect people to stay silent and only post when forced to by grades.", "score": 0},
                    {"text": "They expect sarcasm and jokes from students.", "score": 1},
                    {"text": "They expect polite discussions, honest questions, and helpful answers.", "score": 2},
                    {"text": "They expect mutual respect, encouraging replies, and serious academic teamwork.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can reply helpfully to support an LMS post that is being mocked?",
                "options": [
                    {"text": "Not confident — jumping into a hostile thread makes people start teasing me too.", "score": 0},
                    {"text": "Unsure — I don't want to get involved in public arguments on the LMS.", "score": 1},
                    {"text": "Fairly confident — I can leave a polite, well-thought-out reply answering {target_name}'s question.", "score": 2},
                    {"text": "Very confident — I can answer {target_name}'s question nicely and email the professor if the harassment continues.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do upon seeing this hostile teasing on the LMS forum?",
                "options": [
                    {"text": "Read the drama and maybe give one of the sarcastic replies a thumbs up.", "score": 0},
                    {"text": "Log off the LMS and avoid the thread.", "score": 1},
                    {"text": "Leave a helpful, supportive reply on {target_name}'s post to restore normal discussion.", "score": 2},
                    {"text": "Reply with a helpful answer, say that mocking queries is uncalled for, and inform the teacher if needed.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "In future online course discussions, how will you participate to keep discussions positive?",
                "options": [
                    {"text": "Post only the bare minimum required words and never talk to anyone.", "score": 0},
                    {"text": "Reply only to my closest friends in the class.", "score": 1},
                    {"text": "Reply to classmates with polite, encouraging, and helpful comments.", "score": 2},
                    {"text": "Help create an open, welcoming atmosphere where every student feels comfortable asking questions.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe insulting classmates on official university platforms should have academic consequences?",
                "options": [
                    {"text": "No — online comments should never affect a student's real academic record.", "score": 0},
                    {"text": "Only if very bad words are used, otherwise it's just student banter.", "score": 1},
                    {"text": "Yes — bullying in official university spaces breaks student conduct rules.", "score": 2},
                    {"text": "Definitely — official learning platforms require respect, and harassing classmates should not be allowed.", "score": 3},
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
                "{target_name} and {initiator_name} were paired as lab partners for an intensive practical component of {academic_task}. During a complex procedure, {target_name} accidentally dropped a test tube, causing a minor delay for the team. {initiator_name} took a photo of the shattered glass and posted it in the departmental {platform} with an insulting caption. They labeled {target_name} a clumsy liability and urged classmates never to partner with them in future semesters. Classmates reacted with laughing emojis, while others shared the photo into cross-departmental groups. {target_name} cleaned up the broken glass in tears, left the laboratory before the debrief, and skipped the following lab. A student working at the adjacent lab bench had watched the accident happen and saw the photo posted."
            ),
            (
                "{target_name} made an arithmetic error in the initial calculations for a group lab report in {academic_task}. The instructor caught the mistake during rounds and gently explained the correct formula to both partners. Instead of fixing it, {initiator_name} took a picture of the graded sheet, circled {target_name}'s handwriting, and posted it on {platform}. They added sarcastic commentary questioning how {target_name} managed to pass prerequisite courses. Peers chimed in with jokes about the error, ignoring that the final report still earned a decent mark. {target_name} refused to work with {initiator_name} again, requested an isolated lab station, and stopped speaking during practicals. A classmate who made a similar calculation error on their own sheet was looking at the post."
            ),
            (
                "{target_name} struggled with operating a piece of unfamiliar machinery during a mandatory workshop in {academic_task}. They asked the lab technician for help three times to ensure they were using the equipment safely. {initiator_name} recorded a covert video of {target_name} asking for instructions and uploaded it to {platform}. The video was titled 'How not to do practicals' and gathered dozens of ridiculing comments from senior students. Several classmates recognized that asking for safety advice was responsible, yet said nothing to counter the video. {target_name} avoided attending open lab hours, fell behind on practical milestones, and appeared nervous around machinery. A technician who assisted {target_name} earlier in the day saw a group of students laughing at the video outside."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about leaving all the lab work to your partner and then publicly blaming them in class chats?",
                "options": [
                    {"text": "Smart move — you have to defend your own grade before your partner blames you.", "score": 0},
                    {"text": "Dishonest, but partner fights in university labs happen all the time.", "score": 1},
                    {"text": "Unfair and cowardly — dumping work on someone and then blaming them publicly is wrong.", "score": 2},
                    {"text": "It is completely unacceptable behavior that exploits a teammate and damages their reputation.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do teachers and honest classmates expect when partner disagreements happen in lab practicals?",
                "options": [
                    {"text": "Whoever complains louder in the group chat usually gets believed.", "score": 0},
                    {"text": "People expect partners to argue it out privately without involving others.", "score": 1},
                    {"text": "Honest classmates expect partners to communicate maturely and share work fairly.", "score": 2},
                    {"text": "Teachers expect honest teamwork, fair division of tasks, and respectful communication.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can help explain what really happened if you saw the lab session?",
                "options": [
                    {"text": "Not confident — getting between lab partners is messy and will only bring trouble.", "score": 0},
                    {"text": "Unsure — unless the lab teacher asks me directly, I would stay out of it.", "score": 1},
                    {"text": "Fairly confident — I can confirm that {target_name} worked hard and that {initiator_name} did not help.", "score": 2},
                    {"text": "Very confident — I can speak up in the group to stop false blame and confirm the truth to the lab instructor.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do upon seeing {initiator_name} blame {target_name} in the class chat?",
                "options": [
                    {"text": "Read the argument and post laughing emojis in the chat.", "score": 0},
                    {"text": "Stay quiet and feel glad that I'm not in their lab group.", "score": 1},
                    {"text": "Message {target_name} privately to say I saw them working hard in lab and support them.", "score": 2},
                    {"text": "Post in the chat that {target_name} worked alone, and encourage them to show their work to the teacher.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "If you are partnered with someone who is struggling with lab tasks in the future, what will you do?",
                "options": [
                    {"text": "Do only my part and let them struggle with theirs.", "score": 0},
                    {"text": "Complain to other friends about how slow my partner is.", "score": 1},
                    {"text": "Patiently go through the steps together and divide the work fairly based on strengths.", "score": 2},
                    {"text": "Work together patiently, help them understand the steps, and make sure both of us learn.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe being good at lab work gives any student the right to mistreat their partner?",
                "options": [
                    {"text": "Yes — top students have higher standards and shouldn't be slowed down by weaker partners.", "score": 0},
                    {"text": "Somewhat — getting frustrated is natural when your grade depends on someone else.", "score": 1},
                    {"text": "No — skill means nothing if you don't treat your partners with fairness and respect.", "score": 2},
                    {"text": "Definitely not — true success in university means being both competent and a supportive teammate.", "score": 3},
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
                "{target_name} is a commuter student who travels two hours daily by public point bus to attend university classes. Because of strict bus departure schedules, they had to leave a group project meeting for {academic_task} at five in the afternoon. {initiator_name} and hostel residents posted in {platform} stating that commuter students are lazy and should drop out. They scheduled all remaining meetings at midnight in the campus cafeteria, deliberately making it impossible for {target_name} to participate. Other commuter students in the section felt the unfairness keenly, but remained silent to avoid conflict. {target_name} was removed from the team credit list, had to plead with the course coordinator, and felt deeply alienated. A fellow commuter student who was on the same bus read the group messages while traveling home."
            ),
            (
                "{target_name} commutes from an outlying town each morning to study {academic_task} alongside urban peers. Due to severe road blockages, they arrived thirty minutes late to a collaborative group workshop. {initiator_name} took a photo of {target_name} entering the classroom breathless and posted it on {platform} with a humiliating caption. The post mocked their punctuality and questioned whether students from distant towns belonged at a top university. Classmates reacted with laughing emojis, treating the difficult daily commute as a running joke. {target_name} stopped sitting with the group, began skipping morning lectures, and studied alone at home. A classmate who also experienced transportation delays that morning saw the mocking post."
            ),
            (
                "{target_name} requested that a project team for {academic_task} conduct their weekend discussions online instead of on campus. They explained in {platform} that weekend transportation from their village was unavailable and costly. {initiator_name} mocked the request publicly, stating that students with financial or travel constraints should not choose difficult degrees. Several peers supported {initiator_name}'s dismissive attitude, refusing to accommodate virtual meetings. A few students recognized the insensitivity of the comments, but chose not to get involved. {target_name} paid for an expensive taxi to attend, sat quietly throughout the meeting, and did not speak to anyone. A student who had suggested online meetings earlier that week was reading the group discussion."
            ),
        ],
        "questions": [
            {
                "tpb_construct": "Attitude",
                "question_text": "What do you think about resident students excluding day-scholar commuter students and making fun of their schedule?",
                "options": [
                    {"text": "Commuters should make arrangements to stay late if they want the full university experience.", "score": 0},
                    {"text": "A natural divide — hostel students naturally bond more, and it's inconvenient to adjust for commuters.", "score": 1},
                    {"text": "It is unfair and exclusionary — making fun of someone because of their commute or bus schedule is wrong.", "score": 2},
                    {"text": "It is completely unacceptable elitism that divides the batch and hurts students unfairly.", "score": 3},
                ],
            },
            {
                "tpb_construct": "SubjectiveNorm",
                "question_text": "What do mature and fair university students expect regarding group meeting times?",
                "options": [
                    {"text": "They expect commuter students to adjust to whatever the majority resident group wants.", "score": 0},
                    {"text": "They don't think about scheduling fairness.", "score": 1},
                    {"text": "They expect groups to find daytime hours or use online tools so everyone can join.", "score": 2},
                    {"text": "They expect genuine consideration that respects everyone's transport, family, and home constraints.", "score": 3},
                ],
            },
            {
                "tpb_construct": "PBC",
                "question_text": "How confident are you that you can suggest meeting times that work for commuter classmates?",
                "options": [
                    {"text": "Not confident — hostel students outnumber commuters and will always insist on late nights.", "score": 0},
                    {"text": "Unsure — I wouldn't want to argue with hostel friends over meeting times.", "score": 1},
                    {"text": "Fairly confident — I can suggest daytime library hours or an online call so {target_name} can join.", "score": 2},
                    {"text": "Very confident — I can propose fair meeting times and ensure that no classmate is left out due to the bus.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "What would you honestly do if you saw {target_name} being made fun of for needing to catch the point bus?",
                "options": [
                    {"text": "Agree with the residents that early departures make group work frustrating.", "score": 0},
                    {"text": "Stay quiet and let them work out their transport issues.", "score": 1},
                    {"text": "Suggest having meetings online or during free class slots so {target_name} can fully participate.", "score": 2},
                    {"text": "Remind the group that commuting is a reality for many, insist on daytime meetings, and share all notes with {target_name}.", "score": 3},
                ],
            },
            {
                "tpb_construct": "BehavioralIntention",
                "question_text": "How do you plan to promote inclusion between hostel and commuter students in your classes?",
                "options": [
                    {"text": "Stick to my own circle of friends and not worry about commuter vs hostelite divides.", "score": 0},
                    {"text": "Be polite if asked, but make no special effort.", "score": 1},
                    {"text": "Support sharing all notes and updates online so off-campus students are never left behind.", "score": 2},
                    {"text": "Actively welcome diverse classmates into project groups and make sure everyone feels included.", "score": 3},
                ],
            },
            {
                "tpb_construct": "Attitude",
                "question_text": "Do you believe every student deserves an equal chance to work on projects without being mocked for their living situation?",
                "options": [
                    {"text": "No — university teamwork is based on who you are friends with.", "score": 0},
                    {"text": "Ideally yes, but hard to do in practice.", "score": 1},
                    {"text": "Yes — every student deserves an equal chance to participate without facing mockery.", "score": 2},
                    {"text": "Definitely — university life is better when every student, whether in hostel or commuting, is respected.", "score": 3},
                ],
            },
        ],
    },
]
