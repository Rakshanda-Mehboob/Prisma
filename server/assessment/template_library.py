"""
assessment/template_library.py — Scenario Template Library & Variations.

Psychometrically validated Scenario Template Library for the Theory of Planned Behavior (TPB):
- Measures Attitude, Subjective Norm, Perceived Behavioral Control, Behavioral Intention.
- Exactly 18 distinct scenario templates across 3 core categories:
    1. Social Media Interaction (6 templates)
    2. Private Group Communication (6 templates)
    3. University & Campus Community (6 templates)
- Structure: Exactly 8 items per template (2 ATT, 2 SN, 2 PBC, 2 BI = 8 items).
- Wording: Question-specific, natural, conversational simple English answer options.
- No standard Likert labels (no Strongly Agree/Agree).
- Backend numeric scoring: 0 (lowest construct level), 1 (low), 2 (higher), 3 (highest).
- Students only receive and view option text (scores are never exposed to frontend).
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

def make_q(text: str, construct: str, options: List[Dict[str, Any]], is_reversed: bool = False) -> Dict[str, Any]:
    """Helper to create a question with specific natural options and backend scores."""
    return {
        "tpb_construct": construct,
        "question_text": text,
        "is_reverse_scored": is_reversed,
        "options": options,
    }


SCENARIO_TEMPLATES: List[Dict[str, Any]] = [
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
            make_q(
                "When an anonymous confession page posts a candid picture of a student with a teasing caption, how do you view that situation?",
                "Attitude",
                [
                    {"text": "It is just casual campus entertainment that people forget in a few days.", "score": 0},
                    {"text": "It might be slightly embarrassing, but public social spaces naturally come with occasional teasing.", "score": 1},
                    {"text": "It crosses personal boundaries because unsolicited public attention can cause genuine anxiety.", "score": 2},
                    {"text": "It is harmful and humiliating because public ridicule on large student pages deeply affects someone's emotional safety.", "score": 3},
                ]
            ),
            make_q(
                "How would you describe the effect of students leaving laughing emojis and tagging batchmates under such a post?",
                "Attitude",
                [
                    {"text": "It is just normal social media engagement with no harmful intent.", "score": 0},
                    {"text": "People are usually just tagging friends without thinking about the person in the picture.", "score": 1},
                    {"text": "It turns personal discomfort into a public spectacle for the whole campus to see.", "score": 2},
                    {"text": "It significantly amplifies the distress because each tag shows the student how widely they are being mocked.", "score": 3},
                ]
            ),
            make_q(
                "What would the classmates you spend the most time with expect you to do when a post like this appears?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect me to view it, laugh along, and share it into our chat group.", "score": 0},
                    {"text": "They would expect me to just scroll past and keep our group out of the conversation.", "score": 1},
                    {"text": "They would expect me not to comment, like, or boost the post's visibility.", "score": 2},
                    {"text": "They would support me in reporting the post and asking the page administrator to delete it.", "score": 3},
                ]
            ),
            make_q(
                "How do respected senior students or student representatives generally treat anonymous confession pages targeting classmates?",
                "SubjectiveNorm",
                [
                    {"text": "They treat them as regular campus humor and rarely pay attention.", "score": 0},
                    {"text": "They only get involved if the university administration issues an official warning.", "score": 1},
                    {"text": "They generally disapprove of targeting individual students for public laughs.", "score": 2},
                    {"text": "They actively encourage students to report harmful pages and support the targeted individuals.", "score": 3},
                ]
            ),
            make_q(
                "If you wanted to help remove this humiliating post, how confident would you feel using the platform reporting tools?",
                "PBC",
                [
                    {"text": "I feel completely unsure because social media reporting rarely seems to produce results.", "score": 0},
                    {"text": "I could find the report button, but I doubt my single report would make any difference.", "score": 1},
                    {"text": "I know how to report privacy violations and feel reasonably capable of submitting a clear report.", "score": 2},
                    {"text": "I am fully confident in filing a detailed harassment report and showing friends how to report it as well.", "score": 3},
                ]
            ),
            make_q(
                "If popular students in your batch are actively enjoying and commenting on the thread, how easy is it for you to step in?",
                "PBC",
                [
                    {"text": "Extremely difficult because challenging popular peers would immediately make me a target.", "score": 0},
                    {"text": "Quite challenging because public disagreement would feel very awkward in front of the batch.", "score": 1},
                    {"text": "I could manage to reach out to the page or the targeted student quietly away from the public comments.", "score": 2},
                    {"text": "I feel composed enough to express disagreement or flag the post regardless of who is laughing in the comments.", "score": 3},
                ]
            ),
            make_q(
                "If you come across this confession post while browsing your feed over the next two weeks, what are you most likely to do?",
                "BehavioralIntention",
                [
                    {"text": "Read through the comments out of curiosity and perhaps share it with a roommate.", "score": 0},
                    {"text": "Ignore the post and keep scrolling without taking any action.", "score": 1},
                    {"text": "Submit a report against the post and avoid interacting with the comment thread.", "score": 2},
                    {"text": "Report the post to the platform and message the page admin to request its immediate removal.", "score": 3},
                ]
            ),
            make_q(
                "If you notice {target_name} looking visibly troubled or sitting by themselves on campus after this incident, what is your plan?",
                "BehavioralIntention",
                [
                    {"text": "Keep to myself because personal matters are best left to the individual.", "score": 0},
                    {"text": "Feel bad for them quietly but wait for their close friends to help them.", "score": 1},
                    {"text": "Sit nearby or invite them into our study circle so they do not feel alienated.", "score": 2},
                    {"text": "Check in on them directly, offer sincere reassurance, and let them know they have allies on campus.", "score": 3},
                ]
            ),
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
            make_q(
                "How do you view posting online story polls or quizzes highlighting a classmate's public speaking mistakes?",
                "Attitude",
                [
                    {"text": "It is fair criticism because presenting in class naturally exposes you to peer feedback.", "score": 0},
                    {"text": "It might feel a bit harsh, but lighthearted teasing about presentations is common among students.", "score": 1},
                    {"text": "It is unfair because academic stumbles should never be turned into public entertainment.", "score": 2},
                    {"text": "It creates an intimidating climate that discourages students from speaking up and learning.", "score": 3},
                ]
            ),
            make_q(
                "When students vote and leave sarcastic stickers on a presentation poll, what is your perspective on that behavior?",
                "Attitude",
                [
                    {"text": "Most people are just interacting casually without meaning any real harm.", "score": 0},
                    {"text": "It is somewhat unkind, but students should learn not to take social media polls too seriously.", "score": 1},
                    {"text": "It deepens the embarrassment by turning a learning mistake into public humiliation.", "score": 2},
                    {"text": "It reinforces an unhealthy culture where classmates feel pressured to laugh at someone else's misfortune.", "score": 3},
                ]
            ),
            make_q(
                "What would peers whose academic opinions you value expect you to do regarding a mocking presentation poll?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect me to vote in the poll to see what the percentage breakdown looks like.", "score": 0},
                    {"text": "They would expect me to stay quiet and not get involved in course drama.", "score": 1},
                    {"text": "They would expect me to completely avoid engaging with or validating the poll.", "score": 2},
                    {"text": "They would expect me to tell the creator privately that mocking a presenter is out of line.", "score": 3},
                ]
            ),
            make_q(
                "How do faculty members or academic mentors view public social media polls that ridicule student presentations?",
                "SubjectiveNorm",
                [
                    {"text": "They view it as informal student banter that occurs outside classroom jurisdiction.", "score": 0},
                    {"text": "They only care if the incident disrupts an actual in-person classroom lecture.", "score": 1},
                    {"text": "They consider it unprofessional behavior that damages peer collaboration.", "score": 2},
                    {"text": "They view it as unacceptable harassment that directly undermines academic confidence.", "score": 3},
                ]
            ),
            make_q(
                "How confident are you in approaching the person who posted the poll to suggest taking it down?",
                "PBC",
                [
                    {"text": "I do not feel confident at all because they would probably tell me to mind my own business.", "score": 0},
                    {"text": "I would hesitate because speaking to them might cause awkward tension in our next class.", "score": 1},
                    {"text": "I feel reasonably capable of sending a calm, private message asking them to reconsider.", "score": 2},
                    {"text": "I feel confident explaining clearly why the poll is unfair and asking them to delete it immediately.", "score": 3},
                ]
            ),
            make_q(
                "If multiple section mates are sharing the poll into small group chats, how easy is it to avoid participating?",
                "PBC",
                [
                    {"text": "Very difficult because everyone in the chat expects everyone else to vote and laugh.", "score": 0},
                    {"text": "A bit difficult because staying silent might make me look detached or overly critical.", "score": 1},
                    {"text": "Fairly manageable because I can simply decline to vote or comment in the chat.", "score": 2},
                    {"text": "Completely straightforward because I have no problem setting boundaries against unfair mockery.", "score": 3},
                ]
            ),
            make_q(
                "If you see a story poll targeting a classmate's presentation over the next two weeks, what do you plan to do?",
                "BehavioralIntention",
                [
                    {"text": "Tap through and vote out of quick curiosity to see the results.", "score": 0},
                    {"text": "Skip past the story without voting or responding.", "score": 1},
                    {"text": "Refuse to vote and send an encouraging note to the presenter about their effort.", "score": 2},
                    {"text": "Message the student who created the poll and urge them to remove it right away.", "score": 3},
                ]
            ),
            make_q(
                "When you next interact with {target_name} in your academic course, how do you intend to act?",
                "BehavioralIntention",
                [
                    {"text": "Avoid bringing up anything related to the presentation to prevent awkwardness.", "score": 0},
                    {"text": "Act normally as if nothing happened and wait for them to initiate conversation.", "score": 1},
                    {"text": "Compliment a solid point they made in their slides to restore their academic confidence.", "score": 2},
                    {"text": "Express clear support for their work and partner with them on upcoming class tasks.", "score": 3},
                ]
            ),
        ],
    },
    {
        "template_key": "TEMPL_SM_CAMPUS_VIDEO",
        "category": "social_media",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["TikTok", "Instagram", "Snapchat", "WhatsApp"],
        "departments": ["Any"],
        "livings": ["Any"],
        "context_tags": ["viral_video", "candid_recording", "algorithmic_spread", "reputation_damage"],
        "personalization_tags": {
            "media_type": "short_video",
            "social_habits": ["Video platforms", "Public browsing"],
        },
        "narrative_variations": [
            (
                "{target_name} was carrying a stack of course binders near the main university administrative fountain. They tripped over an uneven paver brick, scattering papers across the walkway while struggling to regain their balance. {initiator_name} captured the entire incident on video from the second-floor corridor railing and posted it to {platform} set to comedic sound effects. Within three hours, the clip gathered over six hundred views, attracting mocking commentary and duplicate reposts across student story reels. Several classmates recognized {target_name} immediately in the footage and forwarded the link into departmental discussion circles. {target_name} felt humiliated, switched their phone to airplane mode, and avoided walking through central campus paths. A peer studying on the nearby benches witnessed the fall and later saw the uploaded video circulating online."
            ),
            (
                "During a crowded semester poster exhibition for {academic_task}, {target_name} accidentally bumped against a display board, causing the stand to collapse. The loud crash drew stares across the entire hall, leaving {target_name} visibly flustered as they hurried to pick up the materials. Someone recorded the blunder on their smartphone and uploaded the video to {platform} with an exaggerated slow-motion effect. Dozens of students commented on the clip with sarcastic jokes, resharing it to sectional groups and personal stories. While several peers found the public mockery unfair, nobody asked the poster to take down the clip. {target_name} left the exhibition early, did not return for the award ceremony, and stopped attending common project sessions. A classmate presenting at the adjacent booth saw the video gaining traction on their social feed."
            ),
            (
                "{target_name} was rushing across the university sports ground to reach an afternoon lab on time when they slipped on wet turf, getting mud on their clothes. {initiator_name} filmed the moment from the stadium pavilion steps and posted the footage on {platform} with a humiliating hashtag. The video trended rapidly within the campus community, generating hundreds of likes and mocking comments from students across different faculties. Some viewers felt the recording crossed a personal boundary, but the post continued to gather traction unchecked. {target_name} spent the rest of the day hiding in an empty tutorial room and refused to attend classes for two days. A student walking behind {target_name} on the path saw the clip circulating widely before evening."
            ),
        ],
        "questions": [
            make_q(
                "When someone films an accidental slip or clumsy moment on campus and shares it online with funny sounds, how do you see that?",
                "Attitude",
                [
                    {"text": "It is classic internet humor and anyone in that situation should just laugh it off.", "score": 0},
                    {"text": "It can be slightly embarrassing, but recording funny public moments is normal on social media.", "score": 1},
                    {"text": "It is an uninvited invasion of privacy that reduces a person's dignity to a quick laugh.", "score": 2},
                    {"text": "It is unacceptable public shaming that causes genuine distress when it spreads across campus.", "score": 3},
                ]
            ),
            make_q(
                "What do you think happens when students forward such videos into departmental WhatsApp groups and story feeds?",
                "Attitude",
                [
                    {"text": "It just provides harmless entertainment between long lecture hours.", "score": 0},
                    {"text": "It gives the clip a little more reach, but it naturally fades from memory in a day or two.", "score": 1},
                    {"text": "It turns an everyday accident into an ongoing source of embarrassment for that student.", "score": 2},
                    {"text": "It traps the student in an overwhelming spotlight, making them feel judged everywhere they walk on campus.", "score": 3},
                ]
            ),
            make_q(
                "What would your circle of close friends expect you to do if a candid video of a classmate starts trending?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect me to forward the link so we can all watch it together.", "score": 0},
                    {"text": "They would expect me to stay quiet and not express an opinion either way.", "score": 1},
                    {"text": "They would expect me to decline to reshare or like the video.", "score": 2},
                    {"text": "They would expect me to report the video and stand up for the person who was recorded.", "score": 3},
                ]
            ),
            make_q(
                "How do students who are well-regarded for their maturity on campus typically respond to viral mockery videos?",
                "SubjectiveNorm",
                [
                    {"text": "They often repost them if the sound editing is humorous.", "score": 0},
                    {"text": "They ignore them quietly without taking any public stance.", "score": 1},
                    {"text": "They advise friends to stop circulating footage taken without someone's knowledge.", "score": 2},
                    {"text": "They openly speak out against circulating non-consensual recordings of fellow students.", "score": 3},
                ]
            ),
            make_q(
                "How capable do you feel of asking a classmate who posted the video to remove it from their public account?",
                "PBC",
                [
                    {"text": "I feel incapable because people usually become defensive and dismissive when asked.", "score": 0},
                    {"text": "I would feel very hesitant because I dislike getting involved in interpersonal friction.", "score": 1},
                    {"text": "I feel reasonably able to send a private note explaining why it should be taken down.", "score": 2},
                    {"text": "I feel fully capable of explaining why keeping the video online is harmful and requesting its deletion.", "score": 3},
                ]
            ),
            make_q(
                "When everyone in a student group is laughing and sharing a viral clip, how difficult is it to ask them to stop forwarding it?",
                "PBC",
                [
                    {"text": "Almost impossible because swimming against the entire group's mood feels overwhelming.", "score": 0},
                    {"text": "Quite hard because nobody wants to be seen as the person who ruins the fun.", "score": 1},
                    {"text": "Manageable if I phrase it calmly without sounding aggressive or accusatory.", "score": 2},
                    {"text": "Entirely doable because doing the right thing matters more than temporary peer approval.", "score": 3},
                ]
            ),
            make_q(
                "If a candid video of a classmate surfaces on your feed in the next two weeks, what do you realistically intend to do?",
                "BehavioralIntention",
                [
                    {"text": "Watch the video and share it with a friend who appreciates campus humor.", "score": 0},
                    {"text": "Swipe past the video and continue browsing my feed.", "score": 1},
                    {"text": "Report the video for harassment using the in-app reporting system.", "score": 2},
                    {"text": "Report the content immediately and message the creator directly to take it down.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan if you cross paths with {target_name} on campus following this viral incident?",
                "BehavioralIntention",
                [
                    {"text": "Look away and pretend I know nothing about the video to avoid awkwardness.", "score": 0},
                    {"text": "Wait to see if they bring up the subject before offering any reaction.", "score": 1},
                    {"text": "Greet them warmly and engage in regular academic conversation to normalize their day.", "score": 2},
                    {"text": "Check in thoughtfully to see how they are holding up and assure them that sensible peers support them.", "score": 3},
                ]
            ),
        ],
    },
    {
        "template_key": "TEMPL_SM_LINKEDIN_DOGPILE",
        "category": "social_media",
        "difficulty_level": 3,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["LinkedIn", "Twitter/X", "Facebook"],
        "departments": ["Business", "Computer Science", "Software Engineering", "Any"],
        "livings": ["Any"],
        "context_tags": ["professional_shaming", "career_sabotage", "comment_brigade", "public_ridicule"],
        "personalization_tags": {
            "media_type": "professional_network",
            "social_habits": ["Career development", "Public browsing"],
        },
        "narrative_variations": [
            (
                "{target_name} is a student who recently published a thoughtful reflective article on {platform} regarding their internship aspirations and learning goals in {academic_task}. {initiator_name}, an influential batchmate with a sizable campus following, took a screenshot of the post and reshared it publicly with sarcastic remarks belittling their professional qualifications. Within hours, multiple classmates joined the comment thread, leaving sarcastic comments questioning {target_name}'s competence and GPA. While some students recognized that public ridicule on a professional network could jeopardize career opportunities, no one defended {target_name}. {target_name} deleted their original post, deactivated their account profile, and felt anxious about attending upcoming industry networking sessions on campus. A classmate working on similar career applications noticed the hostile commentary accumulating on the public thread."
            ),
            (
                "{target_name} announced their selection for a competitive student fellowship related to {academic_task} on their {platform} profile. {initiator_name} immediately commented publicly, hinting that the selection was based on favoritism rather than actual merit. Several peers from the same department chimed in with mocking comments and dismissive remarks, casting doubt on {target_name}'s achievement. A few classmates felt the commentary was malicious and damaging, but chose not to get involved to avoid professional awkwardness. {target_name} stopped posting updates about their academic milestones, withdrew from student society leadership, and avoided interacting with departmental peers. A student who also applied for the fellowship observed the coordinated negative comments on the feed."
            ),
            (
                "{target_name} shared a summary of a university project report for {academic_task} on {platform} to demonstrate their practical skills to prospective employers. {initiator_name} publicly pointed out minor formatting flaws and questioned the integrity of {target_name}'s findings in an aggressive tone. Other classmates piled on by liking the negative remarks and tagging recruiters sarcastically in the replies. Although some viewers realized this behavior crossed ethical professional standards, no one posted a counter-comment. {target_name} removed the portfolio link, felt deeply discouraged about applying for jobs, and skipped the departmental career fair. Another student reviewing the project saw the hostile interaction unfold in real time."
            ),
        ],
        "questions": [
            make_q(
                "How do you view publicly undermining a classmate's achievements or career posts on professional platforms like LinkedIn?",
                "Attitude",
                [
                    {"text": "It is just honest competition and public profiles should expect blunt feedback.", "score": 0},
                    {"text": "It might be overly critical, but people should make sure their posts are flawless before sharing.", "score": 1},
                    {"text": "It is mean-spirited because attacking someone's professional profile can jeopardize real opportunities.", "score": 2},
                    {"text": "It is harmful sabotage that damages a student's career confidence and reputation in front of recruiters.", "score": 3},
                ]
            ),
            make_q(
                "When peers coordinate sarcastic comments or tag recruiters sarcastically under a student's post, what is your view?",
                "Attitude",
                [
                    {"text": "It is just witty banter that adds entertaining drama to professional feeds.", "score": 0},
                    {"text": "It is questionable, but students will eventually learn how to handle critical attention online.", "score": 1},
                    {"text": "It crosses ethical boundaries by turning a peer's genuine milestone into public ridicule.", "score": 2},
                    {"text": "It represents malicious collective bullying designed to humiliate someone in their professional community.", "score": 3},
                ]
            ),
            make_q(
                "What would professors and industry mentors expect students to do when observing hostile comments under a classmate's work?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect students to stay out of it and let the individuals debate it out.", "score": 0},
                    {"text": "They would expect students to only intervene if an official university page is tagged.", "score": 1},
                    {"text": "They would expect students to uphold professional standards and refuse to join negative comment chains.", "score": 2},
                    {"text": "They would expect students to post constructive, respectful comments and defend fair academic discourse.", "score": 3},
                ]
            ),
            make_q(
                "How do students with high integrity in your department handle competitive jealousy when a peer earns a milestone?",
                "SubjectiveNorm",
                [
                    {"text": "They often express their skepticism through sarcastic likes or sub-posts.", "score": 0},
                    {"text": "They remain silent and distance themselves from celebrating the peer's achievement.", "score": 1},
                    {"text": "They acknowledge the milestone civilly and keep any disagreements private.", "score": 2},
                    {"text": "They congratulate the peer warmly and encourage collaborative success across the cohort.", "score": 3},
                ]
            ),
            make_q(
                "How confident do you feel posting a supportive, constructive comment under a thread where influential peers are leaving negative remarks?",
                "PBC",
                [
                    {"text": "Not confident at all because the commentators would likely turn their sarcasm toward me.", "score": 0},
                    {"text": "Uncertain because I prefer not to expose my own professional profile to campus debate.", "score": 1},
                    {"text": "Reasonably confident that I can leave a polite, balanced remark supporting the project.", "score": 2},
                    {"text": "Fully confident in publicly affirming the student's legitimate effort despite negative comments.", "score": 3},
                ]
            ),
            make_q(
                "If leaving a supportive comment risks creating friction with influential classmates in your section, how do you handle that pressure?",
                "PBC",
                [
                    {"text": "I prioritize protecting my own standing and stay completely silent.", "score": 0},
                    {"text": "I feel quite conflicted and usually decide that getting involved is too risky.", "score": 1},
                    {"text": "I find a way to offer support quietly through direct messages rather than in public.", "score": 2},
                    {"text": "I maintain my principles because unfair public sabotage should not be allowed to go unchallenged.", "score": 3},
                ]
            ),
            make_q(
                "If you see a classmate being targeted by negative comments on a professional network in the coming weeks, what do you plan to do?",
                "BehavioralIntention",
                [
                    {"text": "Read the arguments for entertainment without adding anything.", "score": 0},
                    {"text": "Keep moving past the post to avoid getting involved.", "score": 1},
                    {"text": "Reach out privately to the student to validate their work and express encouragement.", "score": 2},
                    {"text": "Leave a positive, professional comment endorsing their effort and flag abusive replies.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan for collaborating with {target_name} on future academic or professional projects?",
                "BehavioralIntention",
                [
                    {"text": "Avoid working with them in case their controversial reputation brings unwanted attention.", "score": 0},
                    {"text": "Only work with them if assigned by the course professor.", "score": 1},
                    {"text": "Be fully open to partnering with them based on their actual merits and dedication.", "score": 2},
                    {"text": "Actively invite them into project teams to ensure they have fair, supportive opportunities to excel.", "score": 3},
                ]
            ),
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
        "context_tags": ["meme_culture", "unauthorized_photo", "social_exclusion", "casual_mockery"],
        "personalization_tags": {
            "media_type": "meme_page",
            "social_habits": ["Meme sharing", "Social interaction"],
        },
        "narrative_variations": [
            (
                "{target_name} was sitting in the university central cafeteria engrossed in their notes for {academic_task}, unconsciously resting their head on their hand with an exhausted expression. A student at a nearby table snapped an unauthorized photo and edited it into a template meme comparing them to an unhappy cartoon character. The meme was posted on an unofficial campus meme account on {platform} and rapidly gained hundreds of likes and humorous resharing. Many classmates tagged each other in the comments, treating the image as harmless campus entertainment. {target_name} discovered the post through a mutual acquaintance, felt deeply self-conscious, and started avoiding public study spaces. A classmate who often studies in the same cafeteria noticed the post circulating through batch networks."
            ),
            (
                "During a lengthy departmental seminar for {academic_task}, {target_name} yawned visibly while sitting in the front row of the lecture hall. Someone in the back row captured the moment with a phone camera, paired it with a sarcastic caption mocking their interest in the course, and published it on a student meme page on {platform}. The post earned dozens of laughing reactions and was reshared across multiple section group stories. Several classmates enjoyed the humor without considering the personal embarrassment it created for {target_name}. {target_name} stopped sitting near the front, avoided asking questions during lectures, and felt judged by peers. A student seated across the aisle recognized the photo angle and realized who took it."
            ),
            (
                "{target_name} was waiting under the campus rain shelter wearing mismatched rain boots during a heavy downpour before their {academic_task} laboratory. An anonymous peer photographed their footwear from a distance and created a viral meme page post on {platform} ridiculing their fashion choices. The image circulated widely through campus student channels, prompting sarcastic remarks and joke votes on student stories. Although some peers felt uncomfortable with turning a classmate into a meme, no one requested the page admin to take down the image. {target_name} felt humiliated, discarded the boots, and stopped socializing with classmates between lecture hours. A friend waiting at the same shelter saw the meme trend online later that evening."
            ),
        ],
        "questions": [
            make_q(
                "How do you view taking unapproved photos of tired or off-guard classmates and turning them into campus memes?",
                "Attitude",
                [
                    {"text": "It is light student fun; creating memes about everyday campus life is completely normal.", "score": 0},
                    {"text": "It might be slightly impolite, but people who appear in memes should take it as a compliment.", "score": 1},
                    {"text": "It is insensitive because using someone's image without permission can cause lasting self-consciousness.", "score": 2},
                    {"text": "It is disrespectful and dehumanizing to convert a fellow student into a public punchline for social media clout.", "score": 3},
                ]
            ),
            make_q(
                "What is your perspective on students commenting and tagging friends under unauthorized memes of classmates?",
                "Attitude",
                [
                    {"text": "Tagging friends is just routine browsing behavior that requires no second thought.", "score": 0},
                    {"text": "It is slightly inconsiderate, but students rarely consider the emotional impact on the person pictured.", "score": 1},
                    {"text": "It directly sustains the mockery by pushing the image onto more feeds across campus.", "score": 2},
                    {"text": "It actively deepens the harm by showing the targeted student that their embarrassment is being celebrated.", "score": 3},
                ]
            ),
            make_q(
                "What would peers whose respect you value expect you to do when an unauthorized meme of a classmate appears?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect me to hit like and drop a laughing sticker in the comments.", "score": 0},
                    {"text": "They would expect me to view it silently and move along.", "score": 1},
                    {"text": "They would expect me to refrain from resharing or adding reactions to the post.", "score": 2},
                    {"text": "They would expect me to ask the meme page admin to remove the photo of our classmate.", "score": 3},
                ]
            ),
            make_q(
                "In your student batch, how do thoughtful students generally treat memes that target recognizable individuals?",
                "SubjectiveNorm",
                [
                    {"text": "They treat all campus memes as harmless comedy regardless of who is depicted.", "score": 0},
                    {"text": "They only object if the meme targets someone from their immediate inner circle.", "score": 1},
                    {"text": "They quietly recognize that personal memes cross ethical boundaries.", "score": 2},
                    {"text": "They set a positive example by encouraging peers not to treat fellow students as joke material.", "score": 3},
                ]
            ),
            make_q(
                "How confident are you that you can message a campus meme page administrator to request deleting a photo of a student?",
                "PBC",
                [
                    {"text": "I have zero confidence because meme page admins usually ignore polite requests.", "score": 0},
                    {"text": "I feel reluctant because drawing attention to myself might make me the subject of the next meme.", "score": 1},
                    {"text": "I feel reasonably capable of sending a courteous request explaining the privacy concern.", "score": 2},
                    {"text": "I feel completely confident in firmly pointing out the privacy violation and demanding its deletion.", "score": 3},
                ]
            ),
            make_q(
                "When a humorous meme about a classmate is circulating in your section chat, how easily can you choose not to share it onward?",
                "PBC",
                [
                    {"text": "Difficult because passing on funny images is the default habit in our group.", "score": 0},
                    {"text": "A bit tempting because joining in the laughter makes group conversations livelier.", "score": 1},
                    {"text": "Easy enough because I can choose not to hit forward or comment.", "score": 2},
                    {"text": "Completely natural because I respect my classmates' dignity more than quick jokes.", "score": 3},
                ]
            ),
            make_q(
                "If an unauthorized meme of a classmate lands on your social feed in the next two weeks, what will you realistically do?",
                "BehavioralIntention",
                [
                    {"text": "React with a laugh and tag a friend who studies in that department.", "score": 0},
                    {"text": "Look at the meme and scroll past without doing anything.", "score": 1},
                    {"text": "Report the post for using someone's personal image without consent.", "score": 2},
                    {"text": "Report the post and privately alert {target_name} with supportive words.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan if you see {target_name} studying alone in the cafeteria after their photo was made into a meme?",
                "BehavioralIntention",
                [
                    {"text": "Sit somewhere else to avoid drawing attention to the awkward situation.", "score": 0},
                    {"text": "Observe from a distance and hope they feel better soon.", "score": 1},
                    {"text": "Sit at the same table and share a pleasant, ordinary conversation.", "score": 2},
                    {"text": "Join them warmly, make sure they feel included, and let them know that good peers respect them.", "score": 3},
                ]
            ),
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
            make_q(
                "How do you view someone creating a parody or spoof profile using a classmate's real photos and identity?",
                "Attitude",
                [
                    {"text": "It is witty satire and students should appreciate the creative humor.", "score": 0},
                    {"text": "It might be somewhat annoying, but parody accounts are common throughout social media.", "score": 1},
                    {"text": "It is deceptive and unfair because impersonation can easily mislead professors and peers.", "score": 2},
                    {"text": "It is a severe violation that threatens a student's personal safety, reputation, and academic future.", "score": 3},
                ]
            ),
            make_q(
                "When classmates follow an impersonation account and comment on its satirical posts, how do you evaluate that?",
                "Attitude",
                [
                    {"text": "Following the account is just keeping up with campus drama for fun.", "score": 0},
                    {"text": "It gives the account a bit more popularity, but followers are not responsible for the creator's actions.", "score": 1},
                    {"text": "Following and commenting legitimizes an unethical attack on a classmate's identity.", "score": 2},
                    {"text": "It actively fuels targeted harassment by providing an audience and social encouragement to the creator.", "score": 3},
                ]
            ),
            make_q(
                "What would responsible classmates and departmental representatives expect you to do upon discovering a fake student account?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect me to follow it quietly to see what gets posted next.", "score": 0},
                    {"text": "They would expect me to stay uninvolved unless the account targets me personally.", "score": 1},
                    {"text": "They would expect me to avoid following or engaging with the imposter account.", "score": 2},
                    {"text": "They would expect me to report the fake account immediately and alert the real student.", "score": 3},
                ]
            ),
            make_q(
                "How do mature peers in your academic program view following accounts that satirize real batchmates?",
                "SubjectiveNorm",
                [
                    {"text": "They treat it as regular entertainment that everyone secretly enjoys.", "score": 0},
                    {"text": "They view it as slightly immature but do not actively discourage it.", "score": 1},
                    {"text": "They see it as disrespectful behavior that harms departmental trust.", "score": 2},
                    {"text": "They firmly condemn impersonation and advocate for swift reporting across student networks.", "score": 3},
                ]
            ),
            make_q(
                "How confident are you that you can help {target_name} report an impersonation account and gather verification evidence?",
                "PBC",
                [
                    {"text": "I feel completely unsure of how impersonation reporting works on that platform.", "score": 0},
                    {"text": "I could try to look up the instructions, but the reporting procedure seems complicated.", "score": 1},
                    {"text": "I feel reasonably capable of walking through the reporting steps to document impersonation.", "score": 2},
                    {"text": "I am fully confident in filing a clear impersonation report and mobilizing others to report it as well.", "score": 3},
                ]
            ),
            make_q(
                "If some classmates believe the fake account's posts are genuine, how easily can you clarify the truth?",
                "PBC",
                [
                    {"text": "Very difficult because once rumors start spreading, people believe whatever they want.", "score": 0},
                    {"text": "Somewhat difficult because correcting peers might drag me into unwanted debates.", "score": 1},
                    {"text": "Manageable because I can post a brief clarification in our class chat.", "score": 2},
                    {"text": "Completely clear because I have no hesitation in stating firmly that the profile is an imposter.", "score": 3},
                ]
            ),
            make_q(
                "If a fake account targeting a student appears in your section over the next two weeks, what do you plan to do?",
                "BehavioralIntention",
                [
                    {"text": "Follow the account to observe the posts before making any judgment.", "score": 0},
                    {"text": "Decline to follow the account but take no further action.", "score": 1},
                    {"text": "Report the account to the platform for identity impersonation.", "score": 2},
                    {"text": "Report the fake profile immediately and message {target_name} to help them get it banned.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan regarding the classmate who is being impersonated when you see them in class?",
                "BehavioralIntention",
                [
                    {"text": "Keep quiet about the account so as not to remind them of the unpleasant situation.", "score": 0},
                    {"text": "Wait to see if they need assistance before offering any comment.", "score": 1},
                    {"text": "Let them know privately that many students realize the account is fake and support them.", "score": 2},
                    {"text": "Reassure them directly and assist them in alerting faculty or student council if necessary.", "score": 3},
                ]
            ),
        ],
    },
{
        "template_key": "TEMPL_PG_BATCH_MOCKERY",
        "category": "private_group",
        "difficulty_level": 1,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Telegram", "Discord"],
        "departments": ["Computer Science", "Software Engineering", "Information Technology", "Engineering", "Any"],
        "livings": ["Any"],
        "context_tags": ["batch_group", "academic_struggle", "group_derision", "silent_bystanders"],
        "personalization_tags": {
            "media_type": "batch_chat",
            "social_habits": ["Academic group chats", "Social interaction"],
        },
        "narrative_variations": [
            (
                "In a 120-member official student WhatsApp batch group for {academic_task}, {target_name} asked an earnest question about an upcoming assignment deadline. {initiator_name}, an academically vocal student, responded with a sarcastic remark mocking their intelligence and asking if they ever paid attention in lectures. Within minutes, several other members joined in with laughing stickers and rude GIFs. Dozens of students viewed the messages in silence, leaving {target_name} with no helpful answer to their original query. {target_name} deleted their question, left the batch group completely, and felt isolated from class communication. A classmate who also found the assignment instructions confusing watched the entire exchange unfold on their phone."
            ),
            (
                "During preparation for midterms in the section Telegram channel for {academic_task}, {target_name} shared a summary note they had prepared. {initiator_name} replied publicly pointing out several grammatical errors and a calculation mistake, sarcastically advising them never to write notes again. Several peers posted laughing emojis and sarcastic remarks, turning {target_name}'s helpful contribution into an embarrassing moment. Although many students knew the notes were genuinely useful, no one defended {target_name} in the chat. {target_name} removed the shared document, muted the channel, and refrained from sharing study resources again. A student who had already downloaded and found the notes helpful read the mocking replies."
            ),
            (
                "On the course Discord study server for {academic_task}, {target_name} asked for assistance debugging a practice problem before a scheduled lab quiz. {initiator_name} took a screenshot of the code snippet and posted it in the general banter channel with a mocking title. Multiple students chimed in with jokes about beginner errors, reacting with sarcastic custom emojis. A few peers realized the criticism was mean-spirited, but they kept quiet to avoid conflict. {target_name} disconnected from the voice channel, closed the application, and struggled through the quiz alone the next morning. A fellow student who was also working on the same problem saw the screenshot posted."
            ),
        ],
        "questions": [
            make_q(
                "When a student is publicly ridiculed in a large class group chat for asking an academic question, how do you view that behavior?",
                "Attitude",
                [
                    {"text": "It is just standard chat sarcasm and students need to develop thicker skin.", "score": 0},
                    {"text": "It is slightly sharp, but basic questions sometimes frustrate classmates before deadlines.", "score": 1},
                    {"text": "It is unfair and discouraging because asking questions is an essential part of learning.", "score": 2},
                    {"text": "It creates a toxic atmosphere that silences struggling students and damages academic trust.", "score": 3},
                ]
            ),
            make_q(
                "How do you view dozens of classmates reading the sarcastic replies and remaining completely silent?",
                "Attitude",
                [
                    {"text": "Staying silent is the wisest choice to avoid unnecessary chat drama.", "score": 0},
                    {"text": "Most people are just busy with their own studies and have no responsibility to step in.", "score": 1},
                    {"text": "Silence indirectly allows the mocking behavior to seem acceptable in the group.", "score": 2},
                    {"text": "Widespread silence makes the targeted student feel completely abandoned by their peers.", "score": 3},
                ]
            ),
            make_q(
                "What would peers whose opinions you value expect you to do when someone is mocked in the batch group?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect me to read through the banter without sending anything.", "score": 0},
                    {"text": "They would expect me to stay quiet and let the conversation move on naturally.", "score": 1},
                    {"text": "They would expect me to avoid joining in with laughing stickers or sarcastic comments.", "score": 2},
                    {"text": "They would respect me if I stepped in with a helpful answer to redirect the chat.", "score": 3},
                ]
            ),
            make_q(
                "How do respected Class Representatives (CRs) or student leaders generally handle mockery in batch groups?",
                "SubjectiveNorm",
                [
                    {"text": "They often ignore it as long as professors are not in the chat.", "score": 0},
                    {"text": "They only intervene if vulgar words or physical threats are exchanged.", "score": 1},
                    {"text": "They remind students to keep official batch channels respectful and academic.", "score": 2},
                    {"text": "They actively establish clear group rules prohibiting public humiliation of any student.", "score": 3},
                ]
            ),
            make_q(
                "How confident do you feel sending a clear, constructive answer to the original question to shift the group focus?",
                "PBC",
                [
                    {"text": "I feel completely unconfident because the vocal members might mock my answer too.", "score": 0},
                    {"text": "I hesitate because drawing attention to myself in a 120-member group feels intimidating.", "score": 1},
                    {"text": "I feel capable of calmly posting the deadline info or relevant lecture slide.", "score": 2},
                    {"text": "I am fully confident in answering the question directly and reminding the group to remain helpful.", "score": 3},
                ]
            ),
            make_q(
                "If vocal students in the group react negatively to anyone who tries to defend {target_name}, how easy is it to speak up?",
                "PBC",
                [
                    {"text": "Extremely difficult because nobody wants to face collective hostility from the chat leaders.", "score": 0},
                    {"text": "Quite hard because public conflict in a large cohort is uncomfortable to navigate.", "score": 1},
                    {"text": "Manageable if I keep my response focused strictly on the assignment facts.", "score": 2},
                    {"text": "Achievable because standing up for fair peer treatment is more important than avoiding minor awkwardness.", "score": 3},
                ]
            ),
            make_q(
                "If a situation like this happens in your class chat during the next two weeks, what do you plan to do?",
                "BehavioralIntention",
                [
                    {"text": "Mute the chat group and check back later when things quiet down.", "score": 0},
                    {"text": "Read the conversation but refrain from participating in any way.", "score": 1},
                    {"text": "Post the correct academic answer in the group to resolve the query.", "score": 2},
                    {"text": "Answer the question publicly and message {target_name} to ensure they have the materials they need.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan regarding {target_name} after seeing them leave the batch group in embarrassment?",
                "BehavioralIntention",
                [
                    {"text": "Assume someone else closer to them will forward them important updates.", "score": 0},
                    {"text": "Wait to see if they re-join the group on their own before reaching out.", "score": 1},
                    {"text": "Send them the key assignment instructions in a private message so they do not fall behind.", "score": 2},
                    {"text": "Reach out with a supportive message, share class notes, and encourage them to re-join the community.", "score": 3},
                ]
            ),
        ],
    },
    {
        "template_key": "TEMPL_PG_LEAKED_CHAT",
        "category": "private_group",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Instagram", "Discord"],
        "departments": ["Any"],
        "livings": ["Any"],
        "context_tags": ["screenshot_leak", "trust_violation", "private_confession", "group_mockery"],
        "personalization_tags": {
            "media_type": "private_message",
            "social_habits": ["Group chats", "Private messaging"],
        },
        "narrative_variations": [
            (
                "{target_name} confided in a classmate via private messages on {platform}, sharing honest personal worries about struggling with marks in {academic_task} and feeling homesick. The recipient took screenshots of the vulnerable confession and forwarded them into an unofficial batch group chat without consent. Members of the group began discussing {target_name}'s private struggles, making insensitive remarks about their emotional resilience. Although several students recognized that forwarding private confidences was an unethical breach of trust, no one called it out in the group. {target_name} discovered the leak when an acquaintance brought it up, leaving them deeply betrayed and unable to trust peers. A classmate who received the forwarded screenshots felt uncomfortable reading them."
            ),
            (
                "{target_name} sent a private message to a peer expressing frustration about a difficult lab grading policy for {academic_task}. The recipient screenshotted the private complaint and circulated it in a private WhatsApp circle consisting of thirty section mates. Members added sarcastic commentary, speculating whether {target_name} would get into trouble with faculty if the professor saw the message. A few students felt circulating private messages was wrong, but the chat continued to share the screenshot with others. {target_name} became anxious that the messages would reach course instructors, stopped attending group discussions, and isolated themselves. A friend who was added to the circle saw the screenshot forwarded multiple times."
            ),
            (
                "{target_name} shared a personal voice note with a friend describing an awkward social interaction that occurred during a campus event. The friend forwarded the audio into a private gaming group on {platform}, where group members began mimicking {target_name}'s voice and laughing at the incident. The audio file was subsequently forwarded across several student circles across campus. Several recipients recognized that circulating private voice notes was inappropriate, yet they listened and laughed anyway. {target_name} found out when peers made inside jokes in front of them, causing intense embarrassment. A student sitting in the same tutorial section was forwarded the voice note by a roommate."
            ),
        ],
        "questions": [
            make_q(
                "When someone leaks screenshots of a classmate's vulnerable private conversation into a group chat, how do you view that action?",
                "Attitude",
                [
                    {"text": "It is juicy group gossip and people should be careful about what they put in text.", "score": 0},
                    {"text": "It is somewhat disloyal, but private messages get shared among friends all the time.", "score": 1},
                    {"text": "It is a painful breach of trust that severely violates personal boundaries.", "score": 2},
                    {"text": "It is an egregious act of betrayal that shatters a student's sense of psychological safety.", "score": 3},
                ]
            ),
            make_q(
                "How do you evaluate group members dissecting and laughing over another student's leaked private worries?",
                "Attitude",
                [
                    {"text": "It is just casual conversation and people will naturally discuss whatever is in the chat.", "score": 0},
                    {"text": "It is insensitive, but most students join in simply out of curiosity rather than malice.", "score": 1},
                    {"text": "It normalizes collective cruelty by making private pain a subject for group entertainment.", "score": 2},
                    {"text": "It is deeply harmful behavior that destroys mutual respect across the entire student group.", "score": 3},
                ]
            ),
            make_q(
                "What would friends who value genuine trust expect you to do when a leaked private screenshot is dropped in the chat?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect me to read through the screenshots and comment on the drama.", "score": 0},
                    {"text": "They would expect me to say nothing and let others talk about it.", "score": 1},
                    {"text": "They would expect me to refuse to forward or react to the leaked messages.", "score": 2},
                    {"text": "They would expect me to state clearly that leaking private confidences is wrong.", "score": 3},
                ]
            ),
            make_q(
                "How do students with strong ethical standards in your batch respond to someone who regularly shares private screenshots?",
                "SubjectiveNorm",
                [
                    {"text": "They find them entertaining because they always have insider information.", "score": 0},
                    {"text": "They listen to them cautiously while being careful not to share their own secrets.", "score": 1},
                    {"text": "They lose respect for that person's reliability and character.", "score": 2},
                    {"text": "They openly discourage the behavior and refuse to participate in gossiping about leaks.", "score": 3},
                ]
            ),
            make_q(
                "How confident are you in typing a message in the group asking peers to stop sharing a classmate's private conversation?",
                "PBC",
                [
                    {"text": "Not confident at all because others would dismiss me as acting like a hall monitor.", "score": 0},
                    {"text": "Hesitant because calling it out might make the chat turn defensive and hostile.", "score": 1},
                    {"text": "Reasonably capable of reminding the group that private conversations shouldn't be circulated.", "score": 2},
                    {"text": "Fully confident in stating firmly that sharing private chats is unacceptable and asking to drop it.", "score": 3},
                ]
            ),
            make_q(
                "If friends in the chat ask you what you think of the leaked conversation, how easily can you decline to join the gossip?",
                "PBC",
                [
                    {"text": "Difficult because not sharing an opinion makes me look aloof or judgmental to my friends.", "score": 0},
                    {"text": "Somewhat hard because curiosity naturally makes you want to discuss the details.", "score": 1},
                    {"text": "Quite manageable because I can politely say that private business should stay private.", "score": 2},
                    {"text": "Completely straightforward because I have firm principles against gossiping about someone's private struggles.", "score": 3},
                ]
            ),
            make_q(
                "If someone forwards a classmate's private screenshot into your group chat in the next two weeks, what do you plan to do?",
                "BehavioralIntention",
                [
                    {"text": "Forward the screenshot to a close friend to get their take on the situation.", "score": 0},
                    {"text": "Read the message and ignore the ongoing chatter in the group.", "score": 1},
                    {"text": "Ask the person who posted it not to circulate private conversations in the group.", "score": 2},
                    {"text": "Object clearly to sharing private chats and privately alert the affected student about the leak.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan for supporting {target_name} after their private messages have been exposed to the cohort?",
                "BehavioralIntention",
                [
                    {"text": "Avoid talking to them about it so they do not feel more embarrassed.", "score": 0},
                    {"text": "Wait to see if they reach out before offering any comment.", "score": 1},
                    {"text": "Send a supportive note assuring them that sensible classmates respect their privacy.", "score": 2},
                    {"text": "Check in warmly, offer genuine friendship, and help them navigate any faculty or peer issues.", "score": 3},
                ]
            ),
        ],
    },
    {
        "template_key": "TEMPL_PG_DISCORD_EXCLUSION",
        "category": "private_group",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["Discord", "WhatsApp", "Telegram"],
        "departments": ["Computer Science", "Software Engineering", "Any"],
        "livings": ["Any"],
        "context_tags": ["online_exclusion", "study_group_removal", "deliberate_isolation", "academic_harm"],
        "personalization_tags": {
            "media_type": "discord_server",
            "social_habits": ["Academic communication", "Gaming communities"],
        },
        "narrative_variations": [
            (
                "A student study and gaming server on {platform} was created for students taking {academic_task} to share resources, past papers, and study guides. {initiator_name}, who served as server administrator, arbitrarily kicked {target_name} out after a minor disagreement during a group project discussion. When other members asked why {target_name} was missing before midterms, {initiator_name} announced publicly in the general text channel that {target_name} was not welcome in their group. Several classmates knew that {target_name} relied on the shared study notes for exam preparation, but they hesitated to question the administrator. {target_name} was cut off from shared study notes, felt rejected by their cohort, and studied alone. A classmate in the server noticed the ban notification in the server logs."
            ),
            (
                "Students in a section created a private collaboration group on {platform} to coordinate revision sessions for {academic_task}. {initiator_name} and two peers decided to exclude {target_name} because they found {target_name}'s study questions repetitive. When {target_name} asked for an invite link, members made excuses about server limits while continuing to share past exam solutions among themselves. Although several students in the group realized the intentional exclusion was unfair and detrimental to {target_name}'s grades, no one shared the invite link. {target_name} spent exam preparation week with incomplete reference material, feeling socially cast out by the entire section. A student who joined the study group earlier that week observed the situation."
            ),
            (
                "A Discord channel formed by classmates for working on {academic_task} suddenly created a restricted sub-channel where all project discussions were moved, deliberately leaving {target_name} in the dark. {initiator_name} instructed other members not to answer {target_name}'s questions about project meetings in the open channel. Some teammates felt uneasy about isolating a fellow student, but they complied to keep on good terms with the server leaders. {target_name} arrived at class unaware of key project decisions, was reprimanded by the professor for lack of contribution, and felt deeply humiliated. A group member who disagreed with the secrecy felt conflicted about speaking up."
            ),
        ],
        "questions": [
            make_q(
                "When a student is deliberately kicked out of or excluded from an academic study server, how do you view that action?",
                "Attitude",
                [
                    {"text": "Group creators have full authority to include or remove anyone they choose.", "score": 0},
                    {"text": "It might be unfortunate, but students should form their own alternative groups if removed.", "score": 1},
                    {"text": "It is petty and unfair because denying access to shared study resources directly hurts someone's grades.", "score": 2},
                    {"text": "It is a damaging form of relational bullying that weaponizes academic resources to socially isolate a peer.", "score": 3},
                ]
            ),
            make_q(
                "How do you view remaining silent when a classmate is cut off from essential exam preparation materials by group leaders?",
                "Attitude",
                [
                    {"text": "Staying silent is practical because picking a fight with the group admin puts your own access at risk.", "score": 0},
                    {"text": "It is an uncomfortable compromise, but members usually protect their own academic interests first.", "score": 1},
                    {"text": "It is a troubling failure of fairness because everyone deserves equal access to shared learning.", "score": 2},
                    {"text": "It is complicity in collective exclusion that leaves a vulnerable student completely stranded.", "score": 3},
                ]
            ),
            make_q(
                "What would fair-minded students in your academic cohort expect members of the server to do?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect members to accept the administrator's decision without interfering.", "score": 0},
                    {"text": "They would expect students to avoid causing friction on the server.", "score": 1},
                    {"text": "They would expect peers to share the study notes with {target_name} outside the server.", "score": 2},
                    {"text": "They would expect members to ask the moderator to reinstate {target_name} and keep the group open.", "score": 3},
                ]
            ),
            make_q(
                "How do professors and academic coordinators generally view private student study groups that practice deliberate exclusion?",
                "SubjectiveNorm",
                [
                    {"text": "They consider unofficial student study groups entirely outside their concern.", "score": 0},
                    {"text": "They advise students to resolve peer disagreements independently.", "score": 1},
                    {"text": "They strongly emphasize collaborative learning and discourage creating exclusionary cliques.", "score": 2},
                    {"text": "They view weaponizing academic study materials against classmates as unacceptable misconduct.", "score": 3},
                ]
            ),
            make_q(
                "How confident are you that you can share lecture slides, past papers, and study guides with an excluded classmate?",
                "PBC",
                [
                    {"text": "Not confident because sharing resources might make the server leaders angry with me.", "score": 0},
                    {"text": "Hesitant because going behind the group's back feels socially complicated.", "score": 1},
                    {"text": "Reasonably confident that I can send the relevant study folders directly in private messages.", "score": 2},
                    {"text": "Fully confident in ensuring {target_name} has every required academic resource regardless of group politics.", "score": 3},
                ]
            ),
            make_q(
                "If asking the server admin to reinstate {target_name} could get you removed as well, how capable do you feel of speaking up?",
                "PBC",
                [
                    {"text": "Completely unable because losing access to exam notes would severely damage my own preparation.", "score": 0},
                    {"text": "Very hesitant because the personal academic risk feels disproportionately high.", "score": 1},
                    {"text": "Able to raise the point diplomatically with the admin in a private direct message.", "score": 2},
                    {"text": "Ready to voice that our study community should remain fair and inclusive for all classmates.", "score": 3},
                ]
            ),
            make_q(
                "If a classmate is intentionally excluded from a course study group in the coming two weeks, what do you plan to do?",
                "BehavioralIntention",
                [
                    {"text": "Stay focused on my own revision and make use of the materials on the server.", "score": 0},
                    {"text": "Feel sympathy for the student but avoid taking any action that creates drama.", "score": 1},
                    {"text": "Quietly forward all shared study materials and past exam keys to {target_name}.", "score": 2},
                    {"text": "Share all study guides with {target_name} and ask server members to end the exclusion.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan for studying with {target_name} before the upcoming exam period?",
                "BehavioralIntention",
                [
                    {"text": "Stick with the main study server group and study separately from {target_name}.", "score": 0},
                    {"text": "Only study with them if they explicitly message me asking for help.", "score": 1},
                    {"text": "Offer to review difficult practice problems together so they do not have to prepare alone.", "score": 2},
                    {"text": "Actively invite them into my study circle and ensure they are fully supported throughout revision.", "score": 3},
                ]
            ),
        ],
    },
    {
        "template_key": "TEMPL_PG_BACKCHANNEL_GOSSIP",
        "category": "private_group",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Instagram", "Discord"],
        "departments": ["Any"],
        "livings": ["Any"],
        "context_tags": ["backchannel_gossip", "secret_chat", "exclusionary_humor", "peer_pressure"],
        "personalization_tags": {
            "media_type": "side_chat",
            "social_habits": ["Group chats", "Social interaction"],
        },
        "narrative_variations": [
            (
                "While {target_name} was actively contributing suggestions in the official course planning chat on {platform} for {academic_task}, {initiator_name} created a parallel secondary group chat called 'Planning Without Drama'. {initiator_name} added nearly everyone from the original group except {target_name}, using the side channel to mock {target_name}'s ideas and coordinate contradictory decisions. When {target_name} proposed ideas in the main chat, members replied with short, cold responses or inside jokes referencing comments from the hidden group. Several members found the parallel channel deceitful and uncomfortable, but they remained in it to stay informed. {target_name} grew increasingly confused, sensed the hostility, and eventually stopped participating in discussions. A student who was added to both groups saw the mocking messages sent in real time."
            ),
            (
                "During an online revision session for {academic_task}, a side backchannel group was formed on {platform} excluding {target_name}. Whenever {target_name} spoke or shared an answer, members of the backchannel exchanged mocking memes and rated their responses sarcastically. Classmates in the main call kept laughing at seemingly unrelated moments, creating an awkward and hostile atmosphere for {target_name}. Although a few students felt the behavior was childish and exclusionary, no one asked the organizers to close the side chat. {target_name} realized they were the subject of unspoken ridicule, left the call early, and avoided subsequent study sessions. A peer participating in the revision session observed the double communication."
            ),
            (
                "In a student society organizing committee on {platform}, {initiator_name} set up an exclusive backchannel group that left out {target_name}. Every initiative {target_name} brought up in the main committee was systematically voted down or criticized because decisions were pre-arranged in the secret chat. Some committee members felt this undermined the team and treated {target_name} unfairly, but they didn't speak up for fear of losing their roles. {target_name} felt completely disrespected, resigned from their committee post, and stopped interacting with society members. A fellow member who witnessed the coordinated dismissals felt guilty about participating."
            ),
        ],
        "questions": [
            make_q(
                "When students create secret side chats specifically to mock and coordinate against an excluded classmate, how do you see that?",
                "Attitude",
                [
                    {"text": "It is completely normal social dynamics; everyone needs a private space to vent about peers.", "score": 0},
                    {"text": "It might be slightly immature, but creating side groups is harmless student behavior.", "score": 1},
                    {"text": "It is deceitful and hostile because it undermines trust and isolates someone without their knowledge.", "score": 2},
                    {"text": "It is toxic relational aggression that deliberately inflicts social humiliation and confusion on a peer.", "score": 3},
                ]
            ),
            make_q(
                "How do you view laughing at inside jokes in the main meeting while knowing they refer to mockery in the secret chat?",
                "Attitude",
                [
                    {"text": "Inside jokes are just funny and keep group meetings from feeling boring.", "score": 0},
                    {"text": "It might make the excluded person feel slightly confused, but no one is directly insulting them.", "score": 1},
                    {"text": "It creates a hostile environment where someone is made to feel out of place without knowing why.", "score": 2},
                    {"text": "It is cruel passive-aggressive behavior that makes the victim feel surrounded by unspoken ridicule.", "score": 3},
                ]
            ),
            make_q(
                "What would classmates with high integrity expect members of a parallel backchannel group to do?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect members to stay in the group and enjoy the humorous commentary.", "score": 0},
                    {"text": "They would expect members to remain silent and not rock the boat.", "score": 1},
                    {"text": "They would expect members to stop fueling the mockery and leave the side group.", "score": 2},
                    {"text": "They would expect members to dismantle the backchannel and advocate for transparent, unified communication.", "score": 3},
                ]
            ),
            make_q(
                "In your university department, how do respected and mature students view creating secret exclusionary groups?",
                "SubjectiveNorm",
                [
                    {"text": "They consider secret side groups standard campus behavior that everyone participates in.", "score": 0},
                    {"text": "They tolerate them quietly even if they feel slightly uncomfortable.", "score": 1},
                    {"text": "They view them as divisive tactics that destroy team chemistry and morale.", "score": 2},
                    {"text": "They firmly refuse to participate in secretive groups organized around peer ridicule.", "score": 3},
                ]
            ),
            make_q(
                "How confident are you that you can tell peers in the side chat that mocking {target_name} is unfair and should stop?",
                "PBC",
                [
                    {"text": "Not confident at all because they would probably create another group that excludes me too.", "score": 0},
                    {"text": "Reluctant because questioning the group's humor might cause immediate social awkwardness.", "score": 1},
                    {"text": "Reasonably confident that I can state that we should focus on the actual project work.", "score": 2},
                    {"text": "Fully confident in explaining that secret mockery is wrong and leaving the side chat if it continues.", "score": 3},
                ]
            ),
            make_q(
                "When everyone in the secret chat is making jokes about {target_name}'s ideas, how easy is it to speak up in {target_name}'s favor in the main chat?",
                "PBC",
                [
                    {"text": "Very difficult because the backchannel members will immediately text about me in the secret group.", "score": 0},
                    {"text": "Somewhat hard because going against the secret consensus feels socially risky.", "score": 1},
                    {"text": "Fairly manageable because I can evaluate {target_name}'s ideas objectively on their merits.", "score": 2},
                    {"text": "Completely straightforward because good ideas deserve honest, public support regardless of side gossip.", "score": 3},
                ]
            ),
            make_q(
                "If you are added to a secret backchannel group formed to mock a classmate in the coming two weeks, what do you plan to do?",
                "BehavioralIntention",
                [
                    {"text": "Stay in the group and read the messages to stay updated on what everyone is saying.", "score": 0},
                    {"text": "Mute the group and never post anything in it.", "score": 1},
                    {"text": "Tell the organizers that side mockery is counterproductive and exit the group.", "score": 2},
                    {"text": "Leave the secret chat and make sure {target_name}'s suggestions are treated fairly in the main group.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan for responding to {target_name}'s contributions in the main group chat?",
                "BehavioralIntention",
                [
                    {"text": "Follow the group's lead and give short, non-committal replies.", "score": 0},
                    {"text": "Wait for others to respond before deciding whether to engage.", "score": 1},
                    {"text": "Reply constructively to their suggestions to ensure discussions remain fair and productive.", "score": 2},
                    {"text": "Actively validate their effort, collaborate openly with them, and foster an inclusive team environment.", "score": 3},
                ]
            ),
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
        "context_tags": ["voice_note", "accent_mockery", "audio_forwarding", "group_derision"],
        "personalization_tags": {
            "media_type": "audio_messaging",
            "social_habits": ["Group chats", "Private messaging"],
        },
        "narrative_variations": [
            (
                "{target_name}, who comes from a different regional background, sent an earnest voice note in the section WhatsApp group explaining a project query for {academic_task}. {initiator_name} downloaded the audio file, added comedic sound effects and pitch distortion, and forwarded it back into the group alongside laughing emojis. Several students began imitating {target_name}'s regional accent, creating voice stickers and meme clips that spread across related campus groups. While some peers recognized that mocking someone's accent bordered on cultural prejudice, no one reprimanded {initiator_name}. {target_name} stopped speaking in group chats, switched entirely to text with minimal words, and felt alienated from classmates. A student from the same hometown heard the distorted voice note circulating."
            ),
            (
                "During a discussion about {academic_task} in a university Telegram channel, {target_name} sent a voice message asking for help locating a lost notebook. Someone isolated a two-second clip of their voice where their pitch cracked, looping it into a mocking audio meme that was shared widely in student circles. Members added laughing reactions, quoting the audio snippet in class hallways and common rooms when {target_name} walked past. Although several classmates knew how humiliating this was, no one told the group to stop. {target_name} kept their head down, stopped attending campus common areas, and walked alone to classes. A classmate who witnessed the original voice note being mocked felt sympathy for {target_name}."
            ),
            (
                "{target_name} sent a hurried voice note to a course study group on {platform} explaining that they were sick and asking someone to record the lecture for {academic_task}. An insensitive peer forwarded the audio to an informal recreational chat with a caption questioning whether {target_name} was faking the illness. Members made sarcastic remarks about {target_name}'s tone and dedication, forwarding the voice note to students in other sections. A few classmates knew {target_name} was genuinely unwell, but they stayed quiet as the jokes continued. {target_name} learned of the mockery upon returning to campus, feeling deeply hurt by the lack of empathy. Another student who was genuinely ill that week heard about the incident."
            ),
        ],
        "questions": [
            make_q(
                "When someone downloads a classmate's earnest voice note and remixes it with comedic effects to mock their voice or accent, how do you view that?",
                "Attitude",
                [
                    {"text": "It is hilarious audio humor and students shouldn't be overly sensitive about friendly teasing.", "score": 0},
                    {"text": "It might be slightly rude, but voice note memes are standard student comedy.", "score": 1},
                    {"text": "It is offensive and hurtful because mocking someone's voice or accent targets their core identity.", "score": 2},
                    {"text": "It is unacceptable discrimination that makes students from different backgrounds feel humiliated and unwelcome.", "score": 3},
                ]
            ),
            make_q(
                "What is your view on classmates quoting mocking voice snippets when the affected student walks past in campus corridors?",
                "Attitude",
                [
                    {"text": "It is just campus banter that will die down as soon as a new joke comes along.", "score": 0},
                    {"text": "It can be awkward for the student, but they should learn to brush off corridor jokes.", "score": 1},
                    {"text": "It crosses into ongoing harassment because it follows the person into their physical campus life.", "score": 2},
                    {"text": "It is deeply intimidating behavior that makes campus feel hostile and emotionally unsafe.", "score": 3},
                ]
            ),
            make_q(
                "What would respectful and considerate classmates expect you to do when an audio meme mocking a peer's accent is shared?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect me to laugh and forward the audio clip to other friends.", "score": 0},
                    {"text": "They would expect me to listen to it quietly and stay neutral.", "score": 1},
                    {"text": "They would expect me to refuse to circulate the audio or use the audio stickers.", "score": 2},
                    {"text": "They would expect me to call out the mockery and ask the sender to delete the remix.", "score": 3},
                ]
            ),
            make_q(
                "In your academic department, how do mature student leaders treat mockery of regional accents or vocal traits?",
                "SubjectiveNorm",
                [
                    {"text": "They ignore it as harmless joking between friends.", "score": 0},
                    {"text": "They chuckle privately while avoiding public comment.", "score": 1},
                    {"text": "They consider accent mockery disrespectful to the diversity of our student body.", "score": 2},
                    {"text": "They firmly stand against accent-based ridicule and promote an inclusive, welcoming culture.", "score": 3},
                ]
            ),
            make_q(
                "How confident are you that you can state in the group chat that mocking someone's voice note is inappropriate?",
                "PBC",
                [
                    {"text": "Not confident at all because people will accuse me of having no sense of humor.", "score": 0},
                    {"text": "Hesitant because speaking up in a large chat group feels awkward and tense.", "score": 1},
                    {"text": "Reasonably capable of sending a calm message saying we shouldn't make fun of how classmates speak.", "score": 2},
                    {"text": "Fully confident in speaking up clearly and setting a standard of respect in the group.", "score": 3},
                ]
            ),
            make_q(
                "If prominent students in the section are repeating the voice joke in person, how easy is it to decline to join the laughter?",
                "PBC",
                [
                    {"text": "Very difficult because laughing along is the easiest way to avoid looking awkward.", "score": 0},
                    {"text": "Somewhat hard because standing in silence when everyone else laughs feels uncomfortable.", "score": 1},
                    {"text": "Quite manageable because I can simply choose not to smile or participate in the joke.", "score": 2},
                    {"text": "Completely natural because I refuse to validate humor built on humiliating a peer.", "score": 3},
                ]
            ),
            make_q(
                "If an audio meme mocking a classmate is shared in your section chat over the next two weeks, what do you plan to do?",
                "BehavioralIntention",
                [
                    {"text": "Listen to the audio and save it to share in a private chat.", "score": 0},
                    {"text": "Listen to the clip and ignore the chat thread.", "score": 1},
                    {"text": "Post a message asking the sender to stop circulating audio memes of classmates.", "score": 2},
                    {"text": "Object clearly in the group and message {target_name} to offer reassurance and support.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan for interacting with {target_name} when you see them in class after this incident?",
                "BehavioralIntention",
                [
                    {"text": "Avoid eye contact so they do not feel self-conscious around me.", "score": 0},
                    {"text": "Treat them normally but avoid discussing what happened in the group.", "score": 1},
                    {"text": "Greet them warmly and listen attentively whenever they speak in group discussions.", "score": 2},
                    {"text": "Engage them enthusiastically in conversation and affirm that their contributions are valued by good peers.", "score": 3},
                ]
            ),
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
        "context_tags": ["notification_spam", "relentless_tagging", "public_pressure", "intrusive_behavior"],
        "personalization_tags": {
            "media_type": "group_notifications",
            "social_habits": ["Group chats", "Notification usage"],
        },
        "narrative_variations": [
            (
                "Following an unresolved debate regarding {academic_task} in a university WhatsApp group, {initiator_name} and three friends began repeatedly tagging {target_name} late at night with demanding and provocative messages. Over sixty notification tags were sent within an hour, waking {target_name} and flooding their phone with aggressive questions and sarcastic remarks. Even after {target_name} requested them to stop and stated they would discuss it during class hours, the tagging continued accompanied by laughing stickers. Other group members muted the chat to avoid the noise, ignoring the harassment taking place. {target_name} was left feeling stressed, sleep-deprived, and intimidated about attending class the next morning. A classmate who was studying late saw the continuous stream of notifications."
            ),
            (
                "On a departmental Discord server, {initiator_name} repeatedly tagged @everyone alongside {target_name}'s username, blaming them publicly for a missing submission link for {academic_task}. The continuous notifications caused multiple students to log in angrily, directing their frustration toward {target_name} without verifying the facts. Although {target_name} explained that the link had been posted by the instructor earlier, the hostile tagging persisted for several hours. Several classmates realized that {target_name} was being unfairly scapegoated, but no one intervened to stop the barrage. {target_name} left the server, turned off all notifications, and felt anxious about class. A peer who had already submitted the assignment saw the unfair blame game."
            ),
            (
                "In a class section group on {platform}, a dispute about group presentation scheduling led several students to spam {target_name}'s username with mocking questions and intrusive demands for immediate replies. Despite {target_name} stating they were at a family function, group members posted continuous alerts questioning their commitment and mocking their absence. Many students in the group observed the spam in silence, reluctant to get caught in the conflict. {target_name} returned home feeling harassed, overwhelmed, and unwilling to participate in team projects with those classmates. A student observing the notifications felt the pressure was unreasonable."
            ),
        ],
        "questions": [
            make_q(
                "When students spam a classmate with dozens of aggressive notification tags late at night, how do you view that behavior?",
                "Attitude",
                [
                    {"text": "It is an effective way to force someone to answer urgent group questions.", "score": 0},
                    {"text": "It is slightly overbearing, but students can always mute their notifications if bothered.", "score": 1},
                    {"text": "It is disrespectful and intrusive because everyone deserves personal boundaries outside university hours.", "score": 2},
                    {"text": "It is an aggressive form of digital harassment designed to intimidate and overwhelm a student.", "score": 3},
                ]
            ),
            make_q(
                "How do you evaluate classmates who simply mute the chat to avoid the notification spam while ignoring the harassment?",
                "Attitude",
                [
                    {"text": "Muting the chat is the smartest move because staying out of drama saves peace of mind.", "score": 0},
                    {"text": "It is understandable since people want quiet sleep and have no duty to intervene.", "score": 1},
                    {"text": "It is unfortunate because passive silence allows aggressive peers to control the group culture.", "score": 2},
                    {"text": "It leaves the targeted student completely isolated under an intense barrage of pressure.", "score": 3},
                ]
            ),
            make_q(
                "What would mature and responsible classmates expect students in the group to do during an aggressive tagging session?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect students to mute their phones and sleep through it.", "score": 0},
                    {"text": "They would expect members to stay quiet and let the involved individuals resolve it tomorrow.", "score": 1},
                    {"text": "They would expect students to tell the senders to stop spamming the group chat.", "score": 2},
                    {"text": "They would expect members to step in firmly, protect group boundaries, and defend {target_name}.", "score": 3},
                ]
            ),
            make_q(
                "How do course instructors and academic advisors view students spamming and harassing peers late at night over group work?",
                "SubjectiveNorm",
                [
                    {"text": "They consider late-night WhatsApp interactions outside official university discipline.", "score": 0},
                    {"text": "They expect students to handle communication frictions among themselves.", "score": 1},
                    {"text": "They view intrusive late-night spam as unprofessional and counterproductive.", "score": 2},
                    {"text": "They strictly condemn intrusive late-night harassment and consider it a disciplinary issue.", "score": 3},
                ]
            ),
            make_q(
                "How confident are you that you can message in the group requesting members to halt late-night aggressive tagging?",
                "PBC",
                [
                    {"text": "Not confident at all because the aggressive members would likely turn their spam on me.", "score": 0},
                    {"text": "Reluctant because intervening in an ongoing argument late at night is stressful.", "score": 1},
                    {"text": "Reasonably confident that I can post a reminder that discussions should resume during class hours.", "score": 2},
                    {"text": "Fully confident in stating firmly that spamming someone's phone is unacceptable harassment that must stop.", "score": 3},
                ]
            ),
            make_q(
                "When multiple students are ganging up and tagging one classmate, how easily can you resist joining in or validating their demands?",
                "PBC",
                [
                    {"text": "Difficult because peer pressure pushes everyone to support the group's frustration.", "score": 0},
                    {"text": "Somewhat hard because remaining detached makes you look uninvested in the project.", "score": 1},
                    {"text": "Easy because I can choose not to add to the notification barrage.", "score": 2},
                    {"text": "Completely straightforward because I refuse to participate in intimidating a fellow student.", "score": 3},
                ]
            ),
            make_q(
                "If an aggressive tagging session breaks out in your class group in the next two weeks, what do you plan to do?",
                "BehavioralIntention",
                [
                    {"text": "Mute notifications and check the chat the next afternoon.", "score": 0},
                    {"text": "Read the messages quietly without sending anything.", "score": 1},
                    {"text": "Send a message asking the senders to stop tagging and discuss the issue during the day.", "score": 2},
                    {"text": "Tell the group to halt the spam immediately and privately check on {target_name}'s well-being.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan for checking in with {target_name} the morning after an intense night of group chat harassment?",
                "BehavioralIntention",
                [
                    {"text": "Say nothing about the chat unless they bring it up first.", "score": 0},
                    {"text": "Wait to see if they look upset before deciding whether to talk to them.", "score": 1},
                    {"text": "Ask them privately how they are doing and express regret over the chat behavior.", "score": 2},
                    {"text": "Meet them warmly before lecture, offer full support, and help them address any group project concerns.", "score": 3},
                ]
            ),
        ],
    },
{
        "template_key": "TEMPL_UC_PROJECT_EXCLUSION",
        "category": "university_community",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Google Drive", "Discord"],
        "departments": ["Computer Science", "Software Engineering", "Business", "Engineering", "Any"],
        "livings": ["Any"],
        "context_tags": ["project_team", "academic_sabotage", "credit_removal", "group_abandonment"],
        "personalization_tags": {
            "media_type": "project_collaboration",
            "social_habits": ["Academic teamwork", "Group communication"],
        },
        "narrative_variations": [
            (
                "During a major semester project for {academic_task}, four students were assigned to work together. Two days before the final report submission, {initiator_name} and two teammates secretly created a separate submission document, omitting {target_name}'s name and contributions entirely. They claimed {target_name} had not done enough work, despite {target_name} having drafted the literature review and introductory sections on the shared drive. When {target_name} noticed they were locked out of the project folder on submission morning, {initiator_name} ignored their panicked calls. Other classmates in the lab saw {target_name} pleading with the team, but chose not to get involved in teammate disputes. {target_name} received a failing grade for the component, broke down emotionally in the hallway, and felt unable to face instructors. A classmate working at an adjacent computer terminal had witnessed {target_name}'s contributions earlier that week."
            ),
            (
                "In a semester-long group presentation for {academic_task}, {initiator_name} and other group members met privately and redistributed the presentation slides without informing {target_name}. On the day of the graded presentation in front of the department, they announced to the course instructor that {target_name} had contributed nothing and should not be allowed to present. {target_name} stood shocked and humiliated in front of the entire class, unable to prove their effort on the spot. While several classmates knew {target_name} had been attending all project discussions, no one spoke up to clarify the situation. {target_name} lost substantial marks, stopped attending social gatherings with batchmates, and requested a section transfer. A student who sat near the group during prep sessions knew {target_name} had attended every meeting."
            ),
            (
                "For a software lab project in {academic_task}, the group repository was managed by {initiator_name}. Right before the final git commit deadline, {initiator_name} removed {target_name}'s commit history and submitted the project without giving {target_name} credit. When {target_name} protested in the lab, teammates dismissed them sarcastically and told them to find another team next time. Other project teams in the laboratory observed the argument, but maintained silence to avoid taking sides. {target_name} was penalized by the lab instructor, felt academically sabotaged, and lost trust in collaborative assignments. A student who worked with {target_name} on a previous assignment knew their work ethic was reliable."
            ),
        ],
        "questions": [
            make_q(
                "When teammates secretly remove a student's name from a collaborative university submission without warning, how do you view that action?",
                "Attitude",
                [
                    {"text": "Teams have the right to drop anyone whose performance does not meet their personal expectations.", "score": 0},
                    {"text": "It might be tough, but protecting the group's grade is more important than interpersonal feelings.", "score": 1},
                    {"text": "It is deeply unfair because cutting someone out without communication deprives them of earned credit.", "score": 2},
                    {"text": "It is an act of academic sabotage that inflicts severe academic and psychological damage on a student.", "score": 3},
                ]
            ),
            make_q(
                "How do you evaluate classmates who witness unfair project exclusion in the lab and choose not to say anything?",
                "Attitude",
                [
                    {"text": "Minding your own business is the safest way to avoid unnecessary project conflict.", "score": 0},
                    {"text": "It is understandable because getting involved in other teams' internal disputes is awkward.", "score": 1},
                    {"text": "It is a disappointing lack of solidarity when someone is being visibly mistreated.", "score": 2},
                    {"text": "Silence allows dishonest team leaders to manipulate grades and exploit vulnerable classmates without consequence.", "score": 3},
                ]
            ),
            make_q(
                "What would professors and fair-minded students expect teammates to do when there are disagreements about project workload?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect the stronger students to take full control and submit without slower members.", "score": 0},
                    {"text": "They would expect teammates to quietly minimize the weaker member's section.", "score": 1},
                    {"text": "They would expect teammates to address workload issues directly and divide tasks transparently.", "score": 2},
                    {"text": "They would expect students to consult the instructor openly to resolve contribution concerns fairly.", "score": 3},
                ]
            ),
            make_q(
                "How do students with high academic integrity in your department treat collaborative group commitments?",
                "SubjectiveNorm",
                [
                    {"text": "They look out only for their own GPA and abandon struggling partners when needed.", "score": 0},
                    {"text": "They tolerate uneven work but complain bitterly behind their teammates' backs.", "score": 1},
                    {"text": "They communicate expectations clearly and document contributions honestly.", "score": 2},
                    {"text": "They actively support every team member and ensure that everyone's legitimate effort is represented.", "score": 3},
                ]
            ),
            make_q(
                "How confident are you that you can advise an unfairly excluded classmate on how to present their contribution history to the professor?",
                "PBC",
                [
                    {"text": "Not confident at all because professors rarely listen to student complaints about group work.", "score": 0},
                    {"text": "Hesitant because getting involved with faculty on someone else's behalf feels risky.", "score": 1},
                    {"text": "Reasonably capable of helping them gather draft files and version history timestamps.", "score": 2},
                    {"text": "Fully confident in helping them document their work clearly and accompanying them to explain the situation to the instructor.", "score": 3},
                ]
            ),
            make_q(
                "If defending an excluded classmate creates tension with other students in the lab, how easily can you stand by what is right?",
                "PBC",
                [
                    {"text": "Very difficult because preserving comfortable peer relationships in the lab is my priority.", "score": 0},
                    {"text": "Somewhat hard because lab politics can make future group assignments uncomfortable.", "score": 1},
                    {"text": "Manageable because I can state what I observed without being aggressive.", "score": 2},
                    {"text": "Completely straightforward because defending academic honesty matters far more than lab popularity.", "score": 3},
                ]
            ),
            make_q(
                "If you see a classmate facing unfair project exclusion in your department during the next two weeks, what do you plan to do?",
                "BehavioralIntention",
                [
                    {"text": "Stay focused on my own group's deadlines and avoid other teams' issues.", "score": 0},
                    {"text": "Feel bad for them but keep out of the conflict.", "score": 1},
                    {"text": "Encourage the student to speak to the course instructor with their draft evidence.", "score": 2},
                    {"text": "Help the student document their contributions and confirm their participation if the instructor asks.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan for working with {target_name} on future academic assignments?",
                "BehavioralIntention",
                [
                    {"text": "Avoid choosing them as a partner because of the controversy surrounding their past group.", "score": 0},
                    {"text": "Wait to see how they perform before deciding whether to partner with them.", "score": 1},
                    {"text": "Be glad to work with them and establish clear, fair task divisions from day one.", "score": 2},
                    {"text": "Actively invite them to partner on future projects and ensure a transparent, mutually supportive collaboration.", "score": 3},
                ]
            ),
        ],
    },
    {
        "template_key": "TEMPL_UC_HOSTEL_SHAMING",
        "category": "university_community",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Instagram", "Snapchat"],
        "departments": ["Any"],
        "livings": ["University hostel", "Shared apartment"],
        "context_tags": ["hostel_life", "living_situation", "mess_hall_ridicule", "roommate_harassment"],
        "personalization_tags": {
            "media_type": "hostel_community",
            "social_habits": ["Hostel living", "Community dining"],
        },
        "narrative_variations": [
            (
                "{target_name} lives in the university student hostel wing while pursuing their degree. One evening, roommates took photos of their personal closet and study desk, which were momentarily cluttered during midterm preparation for {academic_task}. {initiator_name} shared the pictures into the hostel floor WhatsApp group with derogatory captions questioning their cleanliness and upbringing. The post prompted dozens of sarcastic comments from hostel residents, with students laughing openly when {target_name} walked into the dining mess hall for dinner. Several residents felt the photos were an uncalled-for invasion of personal space, but laughed along to fit in with the floor leaders. {target_name} skipped hostel meals, avoided the common washrooms, and spent nights studying in the 24-hour campus library. A student living two doors down saw the pictures posted in the floor chat."
            ),
            (
                "In a shared university student apartment, an argument over quiet study hours led roommates to record {target_name} having an emotional phone call with their parents about academic stress in {academic_task}. A short audio clip was posted in a local hostel community group on {platform} with sarcastic commentary mocking {target_name}'s emotional sensitivity. Over fifty hostel students listened to the clip, making inside jokes whenever {target_name} walked through the courtyard. While many residents knew that recording private family calls violated personal boundaries, no one told the posters to delete it. {target_name} packed their bags, stayed with a relative off-campus, and struggled to focus on upcoming exams. A neighbor who shared the same corridor heard about the audio leak."
            ),
            (
                "During late-night study hours in the hostel common room, {target_name} fell asleep over their textbooks for {academic_task}. A group of hostel residents placed humorous items around them, took videos from multiple angles, and circulated the footage in the hostel residents group chat on {platform}. Residents flooded the thread with mocking commentary, creating stickers that were used in general campus groups. Some students felt the prank crossed into public humiliation, but they kept silent to avoid becoming targets themselves. {target_name} woke up to the mockery, felt unsafe in their own living space, and stopped using the common study facilities. A resident studying in the corner had watched the recording take place."
            ),
        ],
        "questions": [
            make_q(
                "When residents photograph or record a student's personal living space or private emotional calls to mock them in hostel chats, how do you see that?",
                "Attitude",
                [
                    {"text": "Hostel life is informal and students who live in shared quarters should expect pranks.", "score": 0},
                    {"text": "It might be slightly insensitive, but shared living naturally comes with lighthearted teasing.", "score": 1},
                    {"text": "It is an uninvited invasion of personal dignity that destroys trust between roommates.", "score": 2},
                    {"text": "It is severe harassment that deprives a student of safety in the very place where they live and sleep.", "score": 3},
                ]
            ),
            make_q(
                "What do you think about hostel residents laughing and making inside jokes in the dining mess when the targeted student walks in?",
                "Attitude",
                [
                    {"text": "It is just communal banter and everyone gets teased in the dining mess eventually.", "score": 0},
                    {"text": "It is awkward, but students should learn not to pay attention to mess hall jokes.", "score": 1},
                    {"text": "It creates an intimidating atmosphere that makes everyday tasks like eating meals stressful.", "score": 2},
                    {"text": "It is public hostility that forces a student to skip meals and isolate themselves from their living community.", "score": 3},
                ]
            ),
            make_q(
                "What would mature hostel residents and senior students expect peers to do when someone's private space is mocked online?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect residents to enjoy the humor and add their own funny comments.", "score": 0},
                    {"text": "They would expect students to stay out of roommate squabbles.", "score": 1},
                    {"text": "They would expect peers to refuse to share or laugh at photos of private rooms.", "score": 2},
                    {"text": "They would expect residents to demand that the photos be removed and ensure the student is treated with respect.", "score": 3},
                ]
            ),
            make_q(
                "How do respected hostel wardens or residential advisors view circulating candid photos of residents' personal spaces?",
                "SubjectiveNorm",
                [
                    {"text": "They consider informal floor chats outside their jurisdiction unless property is damaged.", "score": 0},
                    {"text": "They advise students to work out personal disagreements quietly.", "score": 1},
                    {"text": "They consider unauthorized photography inside hostel quarters a serious breach of resident rules.", "score": 2},
                    {"text": "They strictly penalize digital harassment and protect every resident's right to privacy and security.", "score": 3},
                ]
            ),
            make_q(
                "How confident are you that you can tell floor mates that taking and sharing private photos of a resident crosses the line?",
                "PBC",
                [
                    {"text": "Not confident at all because the floor leaders would make fun of me for being overly sensitive.", "score": 0},
                    {"text": "Hesitant because creating conflict on your own living floor makes daily life uncomfortable.", "score": 1},
                    {"text": "Reasonably capable of sending a calm message saying we should respect each other's living space.", "score": 2},
                    {"text": "Fully confident in speaking up clearly to demand that private room photos be deleted immediately.", "score": 3},
                ]
            ),
            make_q(
                "If dominant seniors on the floor are leading the mockery in the hostel chat, how easily can you resist joining in?",
                "PBC",
                [
                    {"text": "Very difficult because getting on the wrong side of senior hostel residents can make life miserable.", "score": 0},
                    {"text": "Somewhat hard because going along with the floor leaders is the easiest way to fit in.", "score": 1},
                    {"text": "Manageable because I can choose not to like, react, or comment on their posts.", "score": 2},
                    {"text": "Completely straightforward because my integrity and respect for fellow residents come before floor popularity.", "score": 3},
                ]
            ),
            make_q(
                "If private photos or recordings of a resident are shared in your living group in the next two weeks, what do you plan to do?",
                "BehavioralIntention",
                [
                    {"text": "Look through the pictures and laugh privately with my roommates.", "score": 0},
                    {"text": "Say nothing in the group and continue with my evening routine.", "score": 1},
                    {"text": "Post a message asking peers to delete the photos and respect roommate privacy.", "score": 2},
                    {"text": "Demand the removal of the post and privately check in with the affected resident to offer companionship.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan when you see {target_name} eating alone in the hostel dining hall after this incident?",
                "BehavioralIntention",
                [
                    {"text": "Sit at another table with my regular group to avoid any awkwardness.", "score": 0},
                    {"text": "Eat quickly and leave without saying anything.", "score": 1},
                    {"text": "Give them a friendly nod and make sure they feel acknowledged.", "score": 2},
                    {"text": "Carry my tray to their table, sit with them warmly, and share an enjoyable, normal meal together.", "score": 3},
                ]
            ),
        ],
    },
    {
        "template_key": "TEMPL_UC_SOCIETY_SMEAR",
        "category": "university_community",
        "difficulty_level": 3,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["Instagram", "WhatsApp", "Facebook"],
        "departments": ["Any"],
        "livings": ["Any"],
        "context_tags": ["student_society", "leadership_election", "character_assassination", "whisper_campaign"],
        "personalization_tags": {
            "media_type": "society_campaign",
            "social_habits": ["Student societies", "Campus leadership"],
        },
        "narrative_variations": [
            (
                "During elections for the executive council of the university departmental society, {target_name} ran for the position of General Secretary against {initiator_name}. Two days before voting, an anonymous account on {platform} circulated fabricated rumors claiming {target_name} had mishandled student sponsorship funds during a past festival for {academic_task}. The rumor was forwarded across multiple student batch groups and student society chats, prompting intense suspicion and hostility from peers. Although {target_name} presented official bank receipts verifying their innocence, several students continued to share the accusations. Classmates saw the distress this caused {target_name}, but chose not to get involved in what they viewed as campus politics. {target_name} withdrew from the election, stepped down from all extracurricular activities, and felt disgraced among batchmates. A society member who had audited the accounts knew the financial claims were completely false."
            ),
            (
                "In the campus debating and literary society, {target_name} was nominated to represent the university at an upcoming national inter-university tournament. {initiator_name}, who was not selected, launched a smear campaign on {platform} alleging that {target_name} was picked through favoritism rather than merit in {academic_task}. The post gathered dozens of comments from disgruntled society members, questioning {target_name}'s abilities and demanding a boycott of the delegation. While several senior debaters knew {target_name} had won the internal trials legitimately, they refrained from making public statements. {target_name} declined the nomination, stopped attending society meetings, and felt alienated from their passion. A teammate who competed in the trials knew {target_name}'s scores were the highest."
            ),
            (
                "A student volunteer organization was organizing a campus welfare drive, and {target_name} was selected as lead coordinator. An anonymous student who wanted the position began circulating malicious gossip on {platform} claiming {target_name} had acted condescendingly toward junior volunteers during preparations for {academic_task}. The rumors spread quickly through volunteer WhatsApp groups, leading some juniors to withdraw and whisper behind {target_name}'s back. Although several key volunteers knew {target_name} was exceptionally patient and supportive, no one spoke up in the main group. {target_name} resigned from the coordinator role, felt deeply discouraged, and avoided extracurricular campus involvement. A volunteer who worked closely with {target_name} observed the unfair whispering campaign."
            ),
        ],
        "questions": [
            make_q(
                "When someone circulates fabricated rumors online to damage a peer's reputation before a student election or selection, how do you view that?",
                "Attitude",
                [
                    {"text": "It is part of competitive student politics and anyone running for office should expect tough tactics.", "score": 0},
                    {"text": "It might be unethical, but rumors naturally emerge during heated campus contests.", "score": 1},
                    {"text": "It is dishonest and unfair because spreading unverified claims ruins someone's integrity.", "score": 2},
                    {"text": "It is malicious character assassination that inflicts severe personal trauma and corrupts student leadership.", "score": 3},
                ]
            ),
            make_q(
                "How do you view classmates who continue to forward unverified accusations even after evidence of innocence has been shared?",
                "Attitude",
                [
                    {"text": "People forward what they find interesting; verifying facts is not every student's job.", "score": 0},
                    {"text": "It is careless, but campus gossip is hard to slow down once momentum starts.", "score": 1},
                    {"text": "It is irresponsible behavior that actively spreads falsehoods and harms a classmate.", "score": 2},
                    {"text": "It represents deliberate cruelty that chooses entertaining gossip over truth and justice.", "score": 3},
                ]
            ),
            make_q(
                "What would honest student leaders and faculty advisors expect students to do when defamatory campaign rumors appear?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect students to let the candidates fight it out in public.", "score": 0},
                    {"text": "They would expect students to remain neutral and not get dragged into politics.", "score": 1},
                    {"text": "They would expect students to demand verifiable evidence before believing accusations.", "score": 2},
                    {"text": "They would expect students to publicly reject baseless smear campaigns and uphold clean election standards.", "score": 3},
                ]
            ),
            make_q(
                "How do respected student mentors handle whisper campaigns against fellow student candidates?",
                "SubjectiveNorm",
                [
                    {"text": "They take advantage of the drama to promote their own preferred candidates.", "score": 0},
                    {"text": "They stay quiet to avoid damaging their own political alliances.", "score": 1},
                    {"text": "They privately advise the candidate on how to issue a clarification.", "score": 2},
                    {"text": "They firmly refute false claims across student networks and model integrity in campus leadership.", "score": 3},
                ]
            ),
            make_q(
                "How confident do you feel posting verified facts or evidence in a student group to clear a falsely accused classmate's name?",
                "PBC",
                [
                    {"text": "Not confident at all because supporters of the rival candidate would attack me immediately.", "score": 0},
                    {"text": "Hesitant because getting tagged into campus political arguments is exhausting.", "score": 1},
                    {"text": "Reasonably capable of posting a calm clarification pointing to the verified facts.", "score": 2},
                    {"text": "Fully confident in publicly correcting the false rumors and defending a peer's honest reputation.", "score": 3},
                ]
            ),
            make_q(
                "If friends in your student circle urge you to forward a juicy campaign rumor about a peer, how easily can you refuse?",
                "PBC",
                [
                    {"text": "Difficult because not participating makes me seem out of touch with our group's political interests.", "score": 0},
                    {"text": "Somewhat hard because sharing campus gossip is how students bond.", "score": 1},
                    {"text": "Quite easy because I can simply choose not to forward unverified posts.", "score": 2},
                    {"text": "Completely natural because I have firm principles against spreading unsubstantiated claims about anyone.", "score": 3},
                ]
            ),
            make_q(
                "If an anonymous smear campaign against a student surfaces in your batch chats in the coming two weeks, what do you plan to do?",
                "BehavioralIntention",
                [
                    {"text": "Forward the claims to friends to discuss whether they think it could be true.", "score": 0},
                    {"text": "Read the messages and stay out of the conversation.", "score": 1},
                    {"text": "Ask peers in the group to provide proof before spreading damaging claims.", "score": 2},
                    {"text": "Publicly challenge the baseless rumors and offer clear personal support to {target_name}.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan regarding {target_name} after seeing them withdraw from leadership activities in distress?",
                "BehavioralIntention",
                [
                    {"text": "Avoid discussing society matters so they do not feel bitter.", "score": 0},
                    {"text": "Wait for them to recover their confidence on their own schedule.", "score": 1},
                    {"text": "Reach out privately to let them know that sensible students recognize their honesty.", "score": 2},
                    {"text": "Meet with them warmly, encourage them not to give up on their extracurricular passions, and stand by their side.", "score": 3},
                ]
            ),
        ],
    },
    {
        "template_key": "TEMPL_UC_LMS_BRIGADE",
        "category": "university_community",
        "difficulty_level": 3,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["University portals", "WhatsApp", "Discord"],
        "departments": ["Any"],
        "livings": ["Any"],
        "context_tags": ["lms_forum", "academic_discussion", "comment_brigade", "public_ridicule"],
        "personalization_tags": {
            "media_type": "lms_platform",
            "social_habits": ["Academic communication", "University portals"],
        },
        "narrative_variations": [
            (
                "On the university's official Learning Management System (LMS) discussion portal for {academic_task}, students were required to post thoughtful responses to a weekly lecture topic. {target_name} posted an insightful but unconventional perspective that challenged common assumptions. In an external student WhatsApp group, {initiator_name} shared a link to the LMS thread, urging classmates to go and 'clown' the post. Within two hours, over fifteen students posted sarcastic and condescending replies on the formal university portal, ridiculing {target_name}'s reasoning. Although the professor had not yet reviewed the forum, the public pile-on left {target_name} feeling humiliated on an official academic platform. Classmates observing the thread realized the responses were coordinated, yet none posted a supportive argument. {target_name} deleted their original forum post, refrained from participating in subsequent discussions, and lost academic enthusiasm. A student who agreed with {target_name}'s original perspective saw the coordinated attack unfold."
            ),
            (
                "During an online LMS peer-review session for {academic_task}, students were assigned to leave constructive feedback on classmates' draft submissions. {initiator_name} coordinated with friends on {platform} to give {target_name}'s draft the lowest possible ratings, accompanying the scores with harsh and insulting public critiques. The coordinated negative reviews dragged down {target_name}'s composite score, visible to the entire tutorial group. Several students who reviewed {target_name}'s work knew it was of high quality, but refrained from correcting the biased scores. {target_name} received an unfairly depressed evaluation, felt completely demotivated, and doubted their own academic capabilities. A peer who read the draft recognized that the criticism was completely unfounded."
            ),
            (
                "On the course portal forum for {academic_task}, {target_name} posted a question asking for clarification on an ambiguous exam topic. {initiator_name} took a screenshot and posted it in a Discord channel, prompting multiple students to post condescending comments on the LMS claiming the question was foolish. The public ridicule on the university's official platform caused {target_name} intense embarrassment in front of both classmates and faculty. While many students also found the exam topic unclear, they remained silent as the mocking comments mounted. {target_name} stopped using the course forum for help, struggled through revision alone, and felt alienated. A classmate who also didn't understand the topic watched the forum messages accumulate."
            ),
        ],
        "questions": [
            make_q(
                "When students coordinate in private chats to pile on and leave mocking replies on a peer's official course portal post, how do you view that?",
                "Attitude",
                [
                    {"text": "It is just spirited academic debate and posting publicly means expecting tough criticism.", "score": 0},
                    {"text": "It might be a little harsh, but students will naturally critique ideas they disagree with.", "score": 1},
                    {"text": "It is unfair gang behavior that corrupts academic discussions into personal mockery.", "score": 2},
                    {"text": "It is abusive collective harassment that degrades official learning spaces and silences intellectual curiosity.", "score": 3},
                ]
            ),
            make_q(
                "What is your view on classmates watching a coordinated comment attack on the LMS and leaving no supportive replies?",
                "Attitude",
                [
                    {"text": "Not commenting is smart because drawing professors' attention to a controversial thread is unwise.", "score": 0},
                    {"text": "It is understandable since students have their own assignment deadlines to worry about.", "score": 1},
                    {"text": "It leaves the poster feeling completely isolated in an official university forum.", "score": 2},
                    {"text": "It tacitly allows malicious groups to dictate who feels welcome to participate in course discussions.", "score": 3},
                ]
            ),
            make_q(
                "What would dedicated professors and mature students expect members of the class to do on an official discussion portal?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect students to let the debate play out naturally without interference.", "score": 0},
                    {"text": "They would expect students to only post for mandatory grading points.", "score": 1},
                    {"text": "They would expect students to maintain professional academic courtesy in all replies.", "score": 2},
                    {"text": "They would expect students to post constructive, thoughtful contributions that validate diverse viewpoints.", "score": 3},
                ]
            ),
            make_q(
                "How do respected academic high-achievers in your program respond to unconventional student ideas on the LMS?",
                "SubjectiveNorm",
                [
                    {"text": "They join in pointing out flaws sarcastically to show off their own knowledge.", "score": 0},
                    {"text": "They ignore unusual posts completely.", "score": 1},
                    {"text": "They offer polite, reasoned feedback on the academic arguments.", "score": 2},
                    {"text": "They engage deeply with the perspective and foster respectful, open-minded academic discourse.", "score": 3},
                ]
            ),
            make_q(
                "How confident do you feel writing a constructive, supportive comment on the LMS thread to balance out the hostile replies?",
                "PBC",
                [
                    {"text": "Not confident at all because the coordinated group would likely mock my reply too.", "score": 0},
                    {"text": "Uncertain because posting on the formal course portal where the instructor sees everything feels daunting.", "score": 1},
                    {"text": "Reasonably capable of writing a respectful response engaging with {target_name}'s points.", "score": 2},
                    {"text": "Fully confident in posting a thoughtful, professional reply that validates their ideas and models academic maturity.", "score": 3},
                ]
            ),
            make_q(
                "If peers in an external chat group ask you to join their comment brigade on the LMS, how easily can you decline?",
                "PBC",
                [
                    {"text": "Difficult because declining makes me look unsupportive of my friends' chat activities.", "score": 0},
                    {"text": "Somewhat hard because joining in feels like an easy way to participate in group bonding.", "score": 1},
                    {"text": "Quite easy because I can simply choose not to post on the LMS thread.", "score": 2},
                    {"text": "Completely straightforward because I refuse to participate in coordinated attacks on a classmate.", "score": 3},
                ]
            ),
            make_q(
                "If a peer's post is being targeted by coordinated mockery on the course forum in the next two weeks, what do you plan to do?",
                "BehavioralIntention",
                [
                    {"text": "Read the comments to see how the argument develops without participating.", "score": 0},
                    {"text": "Avoid opening the thread to keep clear of forum drama.", "score": 1},
                    {"text": "Post a calm, constructive reply on the forum supporting the discussion.", "score": 2},
                    {"text": "Write a thoughtful, affirming response on the LMS and advise friends in private chats to stop the brigade.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan for engaging with {target_name} during upcoming tutorial and discussion sessions?",
                "BehavioralIntention",
                [
                    {"text": "Stay quiet during their turns to speak so as not to invite controversy.", "score": 0},
                    {"text": "Wait for other classmates to respond before expressing any thoughts.", "score": 1},
                    {"text": "Acknowledge their points positively during in-class discussions.", "score": 2},
                    {"text": "Actively support their contributions in class, helping restore their confidence as a valued participant.", "score": 3},
                ]
            ),
        ],
    },
    {
        "template_key": "TEMPL_UC_LAB_PARTNER_ABUSE",
        "category": "university_community",
        "difficulty_level": 2,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Discord", "University portals"],
        "departments": ["Engineering", "Computer Science", "Medical Sciences", "Any"],
        "livings": ["Any"],
        "context_tags": ["laboratory_work", "partner_dispute", "public_blame", "technical_failure"],
        "personalization_tags": {
            "media_type": "lab_environment",
            "social_habits": ["Practical laboratory", "Technical teamwork"],
        },
        "narrative_variations": [
            (
                "During a mandatory practical laboratory session for {academic_task}, {target_name} and {initiator_name} were assigned as lab partners. While executing a sensitive procedure, a piece of equipment calibrated by both students malfunctioned, resulting in lost data for that day's session. Immediately upon leaving the lab, {initiator_name} posted in the section WhatsApp group blaming {target_name} entirely, using derogatory language and labeling them incompetent. Several classmates began echoing the criticism, making jokes about never wanting {target_name} as a lab partner. {target_name} tried to explain that the equipment had a pre-existing technical fault, but their explanation was drowned out by sarcastic memes. A few students working at the next workbench knew the machine had been acting up earlier, but they remained silent. {target_name} felt humiliated, dreaded attending future lab sessions, and asked the lab demonstrator for solo seating. A student who used the same bench in the morning session knew the equipment had issues."
            ),
            (
                "In a semester coding lab for {academic_task}, {target_name} accidentally introduced a bug into the shared project repository an hour before the lab evaluation. {initiator_name} went into a rage, taking screenshots of the error log and posting them across departmental chat groups with captions insulting {target_name}'s intelligence. Classmates piled on with mocking comments, questioning how {target_name} passed previous semesters. While several peers understood that software bugs are a normal part of learning, no one stepped in to defuse the anger. {target_name} packed their laptop in tears, skipped the evaluation session, and felt incapable of continuing the course. A peer who had resolved the same bug earlier saw the hostile messages in the chat."
            ),
            (
                "During a collaborative clinical or science practical for {academic_task}, {target_name} hesitated while identifying a laboratory specimen, asking the instructor for guidance. Right after class, {initiator_name} ridiculed their hesitation in the section group on {platform}, asking how someone so slow could expect to graduate. Other group members joined in with laughing stickers, turning a normal learning moment into an ongoing joke. Several classmates felt {initiator_name}'s comments were harsh and unnecessary, but kept their opinions to themselves. {target_name} avoided speaking during practical demonstrations, sat at the furthest table, and lost confidence in their hands-on skills. Another student who also struggled with the identification felt anxious seeing the reaction."
            ),
        ],
        "questions": [
            make_q(
                "When someone publicly blames and insults their lab partner in a class chat over a shared technical mistake, how do you view that?",
                "Attitude",
                [
                    {"text": "It is completely understandable because losing lab marks due to a partner's error is infuriating.", "score": 0},
                    {"text": "It is a bit aggressive, but venting frustration publicly is how students deal with bad teamwork.", "score": 1},
                    {"text": "It is unfair because laboratory errors and equipment faults happen to everyone in practical learning.", "score": 2},
                    {"text": "It is abusive scapegoating that humiliates a partner publicly rather than solving problems cooperatively.", "score": 3},
                ]
            ),
            make_q(
                "How do you view classmates chiming in with sarcastic memes about never wanting that student as a lab partner?",
                "Attitude",
                [
                    {"text": "It is harmless humor that reflects realistic student preferences for good partners.", "score": 0},
                    {"text": "It is somewhat mean, but students naturally make jokes about lab disasters.", "score": 1},
                    {"text": "It reinforces unfair stigma against a classmate who was simply trying to learn.", "score": 2},
                    {"text": "It creates an intimidating climate of shame where making a normal mistake invites collective humiliation.", "score": 3},
                ]
            ),
            make_q(
                "What would lab demonstrators and responsible students expect lab partners to do when an experiment fails?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect the more capable student to make it clear to everyone who made the error.", "score": 0},
                    {"text": "They would expect partners to complain to the instructor about each other.", "score": 1},
                    {"text": "They would expect partners to troubleshoot the mistake together professionally.", "score": 2},
                    {"text": "They would expect partners to share responsibility maturely and seek instructor guidance collaboratively.", "score": 3},
                ]
            ),
            make_q(
                "In your academic department, how do students who are respected for practical skills handle partner mistakes in the lab?",
                "SubjectiveNorm",
                [
                    {"text": "They take over the entire apparatus and push their partner aside.", "score": 0},
                    {"text": "They finish the work in silence and avoid working with that partner again.", "score": 1},
                    {"text": "They explain how to correct the mistake patiently and maintain team morale.", "score": 2},
                    {"text": "They embody true collaborative spirit by supporting their partner's learning without any condescension.", "score": 3},
                ]
            ),
            make_q(
                "How confident are you that you can speak up in the class chat to point out that technical faults happen and errors are part of lab learning?",
                "PBC",
                [
                    {"text": "Not confident at all because the angry partner would likely direct their frustration at me.", "score": 0},
                    {"text": "Hesitant because getting involved in someone else's lab drama feels uncomfortable.", "score": 1},
                    {"text": "Reasonably capable of sending a brief note saying that equipment faults happen to all of us.", "score": 2},
                    {"text": "Fully confident in stating firmly that publicly berating a lab partner is wrong and counterproductive.", "score": 3},
                ]
            ),
            make_q(
                "When other classmates are laughing at memes mocking {target_name}'s lab skills, how easily can you decline to join the mockery?",
                "PBC",
                [
                    {"text": "Difficult because laughing along with the group's complaints is the natural response.", "score": 0},
                    {"text": "Somewhat hard because expressing sympathy might make me look like I support poor lab work.", "score": 1},
                    {"text": "Easy because I can choose not to like or forward the sarcastic memes.", "score": 2},
                    {"text": "Completely straightforward because I value empathy and fairness over cheap group laughs.", "score": 3},
                ]
            ),
            make_q(
                "If a classmate is publicly scapegoated over a lab failure in your class chat during the next two weeks, what do you plan to do?",
                "BehavioralIntention",
                [
                    {"text": "Read the messages and make a mental note to avoid partnering with that student.", "score": 0},
                    {"text": "Mute the chat and let the partners sort out their dispute.", "score": 1},
                    {"text": "Post a message reminding everyone that technical mistakes happen in every lab.", "score": 2},
                    {"text": "Intervene to defend the student publicly and offer to review the practical steps with {target_name} privately.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan if you have an opportunity to partner with {target_name} in an upcoming practical session?",
                "BehavioralIntention",
                [
                    {"text": "Find another partner quickly to ensure my own lab marks are safe.", "score": 0},
                    {"text": "Work with them only if no other partners are available.", "score": 1},
                    {"text": "Gladly partner with them and ensure we support each other through the procedure.", "score": 2},
                    {"text": "Actively invite them to partner, divide the tasks equitably, and build a productive, encouraging lab team.", "score": 3},
                ]
            ),
        ],
    },
    {
        "template_key": "TEMPL_UC_COMMUTER_ISOLATION",
        "category": "university_community",
        "difficulty_level": 1,
        "tpb_dimension": "Balanced TPB",
        "platforms": ["WhatsApp", "Instagram", "Facebook"],
        "departments": ["Any"],
        "livings": ["Home with family", "Other"],
        "context_tags": ["commuter_student", "point_bus", "social_exclusion", "rumor_mongering"],
        "personalization_tags": {
            "media_type": "commuter_network",
            "social_habits": ["Campus commute", "Point bus travel"],
        },
        "narrative_variations": [
            (
                "{target_name} is a day-scholar student who commutes over ninety minutes each way on the university point bus while studying {academic_task}. Because of bus schedules, they must leave campus immediately after the final lecture, making it impossible to attend informal evening campus gatherings. {initiator_name} and several hostel-based classmates began posting sarcastic jokes on {platform} about commuter students who 'disappear' and don't care about the cohort. When {target_name} asked in the batch chat for details about an evening review session they missed, peers ignored the message or replied with dismissive comments. Classmates who also commute understood the travel constraints, but kept quiet to avoid being targeted themselves. {target_name} felt increasingly alienated from university social life, struggled with course updates, and spent commutes feeling isolated. A fellow commuter on the same route saw the dismissive chat responses."
            ),
            (
                "On the university shuttle bus route, a dispute occurred over seat reservations between {target_name} and a friend of {initiator_name}. That evening, {initiator_name} posted a story on {platform} calling {target_name} rude and uncooperative, tagging several students who travel on the same bus route. The post prompted hurtful remarks in the route's unofficial WhatsApp group, leading other students to avoid sitting near {target_name} during daily commutes. Several commuters knew {target_name} was quiet and polite, but they avoided speaking to them on the bus to prevent tension. {target_name} spent two hours every day commuting in complete social isolation, dreading the ride to and from campus. A student who witnessed the original bus interaction knew {target_name} had not acted rudely."
            ),
            (
                "{target_name} had to rush to catch the last departure of the university point bus, accidentally leaving behind a sweater on a bench outside the {academic_task} department. Someone photographed the sweater and posted it in a campus group with sarcastic remarks about commuter students rushing home to their parents. Members made fun of {target_name}'s daily routine and family-oriented lifestyle, circulating the photo across several batch chats. Although some students found the jokes petty and unfair, they laughed along in the comments. {target_name} felt self-conscious about their commuter status, avoided waiting near common pickup points, and kept to themselves. A classmate who also catches the same point bus recognized the sweater."
            ),
        ],
        "questions": [
            make_q(
                "When hostel students mock commuter students for rushing to catch point buses or being unable to stay for evening hangouts, how do you view that?",
                "Attitude",
                [
                    {"text": "It is lighthearted campus humor between hostel residents and day-scholars.", "score": 0},
                    {"text": "It might be slightly dismissive, but commuters should expect to feel a bit out of the loop.", "score": 1},
                    {"text": "It is unfair and inconsiderate because commuting hours are a real constraint beyond a student's control.", "score": 2},
                    {"text": "It is exclusionary bullying that creates harmful divides and makes commuter students feel like second-class peers.", "score": 3},
                ]
            ),
            make_q(
                "How do you evaluate peers ignoring a commuter student's polite questions in the batch chat about review sessions held after bus hours?",
                "Attitude",
                [
                    {"text": "If students cannot attend evening sessions, they shouldn't expect others to catch them up.", "score": 0},
                    {"text": "It is a bit unhelpful, but people in the group are usually busy with their own revision.", "score": 1},
                    {"text": "It is selfish behavior that withholds academic support from a hardworking classmate.", "score": 2},
                    {"text": "It is deliberate social exclusion that actively punishes someone for their family or living circumstances.", "score": 3},
                ]
            ),
            make_q(
                "What would considerate classmates expect students who attend evening sessions to do for commuter peers?",
                "SubjectiveNorm",
                [
                    {"text": "They would expect commuters to ask the instructor directly rather than bothering classmates.", "score": 0},
                    {"text": "They would expect members to only share notes if they happen to be close friends.", "score": 1},
                    {"text": "They would expect peers to share brief summaries when asked in the group chat.", "score": 2},
                    {"text": "They would expect students to proactively share session notes, recordings, and key takeaways with commuters.", "score": 3},
                ]
            ),
            make_q(
                "In your university batch, how do thoughtful students bridge the gap between hostel residents and day-scholars?",
                "SubjectiveNorm",
                [
                    {"text": "They keep their social circles strictly divided between hostellers and commuters.", "score": 0},
                    {"text": "They interact civilly during lectures but organize events without considering bus timings.", "score": 1},
                    {"text": "They schedule group meetings during daytime campus hours so commuters can participate.", "score": 2},
                    {"text": "They actively build an inclusive community where commute constraints are respected and accommodated.", "score": 3},
                ]
            ),
            make_q(
                "How confident are you that you can share lecture recordings, session summaries, or notes with a commuter classmate who had to catch the bus?",
                "PBC",
                [
                    {"text": "Not confident because keeping track of others' schedules is not my responsibility.", "score": 0},
                    {"text": "Hesitant because sharing notes takes extra time and effort after a long day.", "score": 1},
                    {"text": "Reasonably capable of sending a quick photo of the meeting notes or whiteboard summary.", "score": 2},
                    {"text": "Fully confident in ensuring {target_name} receives all study materials promptly so they never fall behind.", "score": 3},
                ]
            ),
            make_q(
                "If friends in the chat are joking about commuter students rushing for the bus terminal, how easily can you decline to join the mockery?",
                "PBC",
                [
                    {"text": "Difficult because laughing at point bus jokes is a staple of campus conversation.", "score": 0},
                    {"text": "Somewhat hard because calling out simple jokes makes you look overly sensitive.", "score": 1},
                    {"text": "Easy because I can choose not to send laughing stickers or comments.", "score": 2},
                    {"text": "Completely straightforward because I respect my peers' daily commitments and travel efforts.", "score": 3},
                ]
            ),
            make_q(
                "If an evening study update is needed by a commuter student in your class group in the coming two weeks, what do you plan to do?",
                "BehavioralIntention",
                [
                    {"text": "Leave the message unread and let someone else respond.", "score": 0},
                    {"text": "Wait to see if the group leader posts an update before doing anything.", "score": 1},
                    {"text": "Reply in the chat with a summary of key decisions made during the session.", "score": 2},
                    {"text": "Send {target_name} comprehensive notes and ensure all their questions are thoroughly answered.", "score": 3},
                ]
            ),
            make_q(
                "What is your plan for greeting and interacting with {target_name} on the point bus or at the campus terminal?",
                "BehavioralIntention",
                [
                    {"text": "Wear headphones and look out the window to avoid having to make conversation.", "score": 0},
                    {"text": "Say a brief hello only if we happen to make direct eye contact.", "score": 1},
                    {"text": "Smile, greet them pleasantly, and ask how their classes went today.", "score": 2},
                    {"text": "Sit with them warmly, offer genuine companionship during the commute, and make sure they feel valued.", "score": 3},
                ]
            ),
        ],
    }
]
