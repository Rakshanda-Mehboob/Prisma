"""
interventions/content.py — Core Curricular Content and Activities for Modules 1–4.

Grounded in the Theory of Planned Behavior (TPB):
  - Module 1: Introduction to Cyberbullying (Attitude)
  - Module 2: Causes and Effects of Cyberbullying (Attitude)
  - Module 3: Preventive and Reactive Measures (Perceived Behavioral Control)
  - Module 4: Your Role – Peer Dynamics and Social Norms (Subjective Norms)
"""

MODULE_CURRICULUM = {
    1: {
        "module_number": 1,
        "title": "Module 1: Introduction to Cyberbullying",
        "subtitle": "Understanding Forms, Mediums, and Impact",
        "target_construct": "Attitude",
        "target_construct_key": "attitude",
        "target_construct_display": "Attitude",
        "estimated_minutes": 15,
        "overview": (
            "This module establishes a clear, rigorous understanding of what cyberbullying is, "
            "how it manifests across digital platforms in university life, and why treating it as "
            "'harmless campus banter' causes severe psychological and academic damage."
        ),
        "learning_objectives": [
            "Define cyberbullying and identify what distinguishes it from benign online humor.",
            "Recognize the 6 major forms of cyberbullying prevalent among university students.",
            "Understand the role of modern platforms (WhatsApp, Instagram, Discord, Confession pages).",
            "Examine a local Pakistani campus news case study and its real-world fallout.",
            "Complete the 'Rida's Story' categorization activity to practice identifying digital harms."
        ],
        "sections": [
            {
                "title": "1. What Is Cyberbullying?",
                "content": (
                    "**Cyberbullying** is defined as repetitive, intentional aggression or harassment inflicted "
                    "through electronic communication devices, networks, and social media platforms. "
                    "While traditional interpersonal conflict occurs face-to-face, cyberbullying has unique, "
                    "destructive characteristics that amplify its harm:\n\n"
                    "- **24/7 Accessibility:** There is no physical sanctuary. A victim receives notifications at home, "
                    "in dorms, or during late-night study hours.\n"
                    "- **Exponential Viral Reach:** A humiliating screenshot or derogatory poll can spread across "
                    "entire departmental batches within minutes.\n"
                    "- **Permanence of Digital Footprints:** Screenshots and downloaded media can resurface repeatedly, "
                    "threatening the victim's future academic standing and career prospects.\n"
                    "- **The Online Disinhibition Effect:** Perpetrators feel shielded behind screens, leading them to say "
                    "and do things they would never dare say face-to-face."
                )
            },
            {
                "title": "2. Common Forms of Cyberbullying",
                "content": (
                    "In university environments, cyberbullying takes subtle and overt forms:\n\n"
                    "1. **Harassment & Flaming:** Sending insulting, hostile, or sexually demeaning messages repeatedly "
                    "in direct messages or public comment sections.\n"
                    "2. **Denigration & Defamation:** Spreading false rumors, distorted gossip, or fabricated claims "
                    "designed to destroy a student's personal or academic reputation.\n"
                    "3. **Impersonation & Fake Profiles:** Creating fake Instagram, Facebook, or WhatsApp accounts "
                    "using a classmate's name, pictures, or phone number to post vulgar remarks in their name.\n"
                    "4. **Outing & Trickery:** Coaxing a peer into sharing private secrets, personal photos, or voice notes, "
                    "and then broadcasting them publicly without consent.\n"
                    "5. **Cyber-Exclusion & Ostracism:** Deliberately locking or kicking a student out of class study groups, "
                    "project Discord servers, or batch WhatsApp channels to isolate them socially and academically.\n"
                    "6. **Cyberstalking:** Persistent, unwanted digital surveillance, obsessive tagging, or sending "
                    "threatening messages that generate acute fear for personal safety."
                )
            },
            {
                "title": "3. Digital Mediums and University Hotspots",
                "content": (
                    "Cyberbullying in Pakistani universities frequently leverages specific digital ecosystems:\n\n"
                    "- **Class & Batch WhatsApp Groups:** Passive harassment during academic disagreements or "
                    "covert mockery via stickers created from classmates' photos.\n"
                    "- **Anonymous 'Confession' Pages:** Unmoderated Instagram and Facebook accounts where anonymous "
                    "accusations and mockery bypass accountability.\n"
                    "- **Discord & Gaming Channels:** Exclusionary tactics during collaborative work and group assignments.\n"
                    "- **Snapchat & Disappearing Chats:** False sense of zero consequence leading perpetrators to send "
                    "coercive or abusive content."
                )
            },
            {
                "title": "4. Local Pakistani News Case Study",
                "content": (
                    "**Case File: The Anonymous Campus Confession Page Fallout (Islamabad, 2022)**\n\n"
                    "At a prominent university in Islamabad, an anonymous Instagram page titled 'Campus Confessions' "
                    "began posting defamatory allegations targeting female students in the computing department. "
                    "One student's private presentation screenshot was edited with offensive commentary and mocked "
                    "by hundreds of peers. The victim suffered acute panic attacks, stopped attending mid-term exams, "
                    "and her family considered withdrawing her from the university.\n\n"
                    "Perpetrators justified their actions as 'just campus banter and meme culture.' However, the university's "
                    "Discipline Committee, in coordination with the **FIA National Response Centre for Cyber Crime (NR3C)**, "
                    "unmasked the account administrators. Two students were suspended for two semesters and faced formal charges "
                    "under the **Prevention of Electronic Crimes Act (PECA 2016)**.\n\n"
                    "*Takeaway:* What begins as casual online mockery behind an anonymous handle carries life-altering "
                    "consequences for both the target and the perpetrator."
                )
            }
        ],
        "activity": {
            "type": "categorization",
            "title": "Interactive Reading Activity: Rida's Story",
            "instructions": (
                "Read the scenario below. Then analyze the three specific incidents described in the story "
                "and correctly categorize each form of cyberbullying from the drop-down choices."
            ),
            "story": (
                "Rida is a second-year Software Engineering student. Before final lab evaluations, a senior peer "
                "pressured her to share her graded project code in an unofficial batch chat. When Rida politely declined "
                "to maintain academic integrity, several classmates launched a coordinated retaliation campaign:\n\n"
                "• Incident 1: Students took Rida's profile picture from her university portal, converted it into mocking WhatsApp stickers, "
                "and circulated them with sarcastic captions about 'teachers' pets'.\n"
                "• Incident 2: In class discussion threads, whenever Rida asked an academic question, two classmates replied with sarcastic "
                "insults claiming she bought her grades, causing public embarrassment.\n"
                "• Incident 3: The batch group admins removed Rida from the shared course notes drive and study group, leaving her without "
                "critical exam prep materials."
            ),
            "items": [
                {
                    "id": "inc_1",
                    "text": "Incident 1: Converting Rida's photo into mocking WhatsApp stickers and circulating them with sarcastic captions.",
                    "correct_category": "Denigration & Defamation",
                    "options": [
                        "Harassment & Flaming",
                        "Denigration & Defamation",
                        "Cyber-Exclusion & Ostracism",
                        "Impersonation"
                    ],
                    "explanation": "Creating and circulating derogatory memes or stickers from someone's photo is Denigration—spreading damaging representations to demean a peer."
                },
                {
                    "id": "inc_2",
                    "text": "Incident 2: Publicly posting sarcastic insults in class threads claiming she bought her grades whenever she asked a question.",
                    "correct_category": "Harassment & Flaming",
                    "options": [
                        "Harassment & Flaming",
                        "Cyberstalking",
                        "Outing & Trickery",
                        "Cyber-Exclusion & Ostracism"
                    ],
                    "explanation": "Repeated hostile, insulting comments directed at someone during public academic discourse constitutes Harassment & Flaming."
                },
                {
                    "id": "inc_3",
                    "text": "Incident 3: Removing Rida from the shared notes drive and study group to deprive her of exam preparation materials.",
                    "correct_category": "Cyber-Exclusion & Ostracism",
                    "options": [
                        "Denigration & Defamation",
                        "Impersonation",
                        "Cyber-Exclusion & Ostracism",
                        "Harassment & Flaming"
                    ],
                    "explanation": "Intentionally expelling a peer from academic study groups or shared resources is Cyber-Exclusion & Ostracism, weaponizing peer isolation."
                }
            ]
        }
    },

    2: {
        "module_number": 2,
        "title": "Module 2: Causes and Effects of Cyberbullying",
        "subtitle": "Exploring Root Motivations and Building Empathy",
        "target_construct": "Attitude",
        "target_construct_key": "attitude",
        "target_construct_display": "Attitude",
        "estimated_minutes": 15,
        "overview": (
            "This module shifts student attitudes by demystifying the root psychological motivations behind "
            "online cruelty and illustrating the profound, long-lasting emotional and academic damage inflicted on targets."
        ),
        "learning_objectives": [
            "Analyze the psychological root causes: academic jealousy, relationship breakups, and tribal enmity.",
            "Understand the clinical and academic impact: chronic anxiety, depression, and social withdrawal.",
            "Review sensitive guidance regarding suicidal ideation and learn about available campus support resources.",
            "Complete the 'Fatima's Story' empathy training through structured perspective-taking prompts."
        ],
        "sections": [
            {
                "title": "1. What Drives Cyberbullying in Universities?",
                "content": (
                    "Contrary to popular belief, cyberbullying rarely happens randomly. In higher education, it is "
                    "usually driven by distinct psychological triggers:\n\n"
                    "- **Academic Jealousy & Grade Rivalry:** Resentment when a peer secures higher grades, prestigious "
                    "internships, or praise from professors. Mocking them online is an attempt to diminish their achievement.\n"
                    "- **Relationship Breakups & Social Rejection:** Ended romances or severed friendships often trigger "
                    "retaliatory leaks of private texts, photos, or vindictive rumors.\n"
                    "- **Interpersonal Enmity & Campus Cliques:** Rivalry between student societies, hostel wings, or "
                    "departmental factions where attacking perceived rivals brings social validation from one's in-group.\n"
                    "- **Boredom & Social Validation Seeking:** Bullying for the 'meme potential'—sacrificing someone's "
                    "dignity to gain likes, laughing reactions, and perceived popularity."
                )
            },
            {
                "title": "2. Psychological Toll on Victims",
                "content": (
                    "Digital attacks inflict deep psychological trauma because targets feel unable to escape:\n\n"
                    "- **Severe Anxiety & Hypervigilance:** Victims dread every phone notification, fearing new memes, "
                    "mocking messages, or exclusion.\n"
                    "- **Depression & Demoralization:** Persistent feelings of worthlessness, self-blame, and social "
                    "disconnection from classmates.\n"
                    "- **Academic Disruption:** Inability to concentrate on coursework, skipping lectures to avoid stares, "
                    "and measurable declines in GPA.\n"
                    "- **Somatic Symptoms:** Insomnia, chronic tension headaches, appetite loss, and gastrointestinal issues."
                )
            },
            {
                "title": "3. Sensitive Note on Suicidal Ideation & Support Resources",
                "content": (
                    "**Crucial Clinical Context & Support:**\n\n"
                    "When harassment feels relentless and public isolation becomes unbearable, some students experience "
                    "severe feelings of hopelessness, despair, and suicidal ideation. Words typed behind a keyboard can push "
                    "a peer into a life-threatening mental health crisis.\n\n"
                    "> **Support & Crisis Resources:**\n"
                    "> If you or a classmate are experiencing overwhelming distress, you are not alone. Confidential help is available:\n"
                    "> - **University Student Counseling Centre:** Campus Health Center & Student Affairs Office\n"
                    "> - **National Mental Health Helpline (Pakistan):** Call **1166** (24/7 Toll-Free)\n"
                    "> - **Umang Mental Health Helpline:** 0311-7786264 / 0317-4288665\n"
                    "> - **Faculty Advisors:** Speak with your academic coordinator or department head in strict confidence."
                )
            }
        ],
        "activity": {
            "type": "empathy_training",
            "title": "Empathy Training Activity: Fatima's Story",
            "instructions": (
                "Read Fatima's experience below carefully. Then answer the two perspective-taking reflection questions. "
                "Writing sincere, thoughtful reflections is required to complete this module."
            ),
            "story": (
                "Fatima is a first-year student from a small rural town who moved to Islamabad on a merit scholarship. "
                "During her first semester English presentation, she spoke with a noticeable regional accent and mispronounced "
                "a technical term. A classmate in the front row recorded a 15-second video clip without her permission.\n\n"
                "By evening, the video was edited with mocking cartoon sound effects and uploaded to an unofficial campus meme group. "
                "Over 80 classmates reacted with laughing emojis, and the comment section mocked her hometown and background. "
                "Over the next three weeks, Fatima stopped sitting in the front row, ate lunch alone in empty hallways, "
                "and eventually began skipping morning classes to avoid running into peers."
            ),
            "prompts": [
                {
                    "id": "prompt_1",
                    "question": "What would you do if you were Fatima?",
                    "guidance": "Reflect on waking up to dozens of notifications mocking your speech, family background, and accent. How would this impact your self-worth, academic focus, and feeling of safety on campus?",
                    "min_words": 15
                },
                {
                    "id": "prompt_2",
                    "question": "What if your close friend or sibling were Fatima?",
                    "guidance": "Imagine watching your younger sister or closest childhood friend return from campus crying because of an online meme video. How would that shift your perspective on campus 'humor' and passive bystander silence?",
                    "min_words": 15
                }
            ]
        }
    },

    3: {
        "module_number": 3,
        "title": "Module 3: Preventive and Reactive Measures",
        "subtitle": "Digital Hygiene, Platform Reporting, and Legal Protections",
        "target_construct": "PBC",
        "target_construct_key": "pbc",
        "target_construct_display": "Perceived Behavioral Control",
        "estimated_minutes": 20,
        "overview": (
            "This module builds practical behavioral control and technical self-efficacy. Students learn proactive digital "
            "hygiene to safeguard accounts and a step-by-step incident response protocol for documenting evidence, "
            "reporting on major social platforms, and utilizing Pakistani cybercrime laws (PECA 2016 / FIA NR3C)."
        ),
        "learning_objectives": [
            "Implement 7 essential preventive cybersecurity habits (privacy settings, 2FA, credential safety).",
            "Master the 3-step reactive protocol: Preserve Evidence, Restrict/Block, Report.",
            "Understand platform-specific reporting procedures (Instagram, Facebook, X, TikTok, Snapchat).",
            "Know your rights and reporting channels under PECA 2016 and FIA NR3C.",
            "Complete the interactive Evidence Preservation & Response simulation."
        ],
        "sections": [
            {
                "title": "1. Preventive Measures: Proactive Digital Hygiene",
                "content": (
                    "Prevention starts with controlling your digital exposure and securing credentials:\n\n"
                    "1. **Never Share Passwords:** Never share passwords or PINs with friends, classmates, roommates, or partners.\n"
                    "2. **Enable Two-Factor Authentication (2FA):** Turn on authenticator-app-based 2FA on WhatsApp, Google, "
                    "Instagram, and university portals.\n"
                    "3. **Lock Devices Automatically:** Set a short screen timeout (1–2 minutes) with biometric or PIN lock. "
                    "Never leave laptops unlocked in campus libraries or labs.\n"
                    "4. **Restrict Privacy & Audience:** Set social accounts to Private. Restrict who can view stories, tag your handle, "
                    "or add you to messaging groups.\n"
                    "5. **Safeguard Personal Data & Photos:** Avoid storing unencrypted sensitive photos or private documents on shared "
                    "cloud folders or peer flash drives.\n"
                    "6. **Avoid Unsafe Public Wi-Fi:** Campus public networks without passwords can expose session tokens. Use trusted "
                    "cellular data or verified encrypted VPNs.\n"
                    "7. **Rotate Passwords Periodically:** Change master passwords every 90 days. Use long, unique passphrases."
                )
            },
            {
                "title": "2. Reactive Measures: Step-by-Step Response Protocol",
                "content": (
                    "If you or a peer face cyber harassment, follow this strict response protocol:\n\n"
                    "### Step 1: Preserve Digital Evidence (DO NOT DELETE FIRST)\n"
                    "- Take full-screen screenshots showing the **date, exact timestamp, sender handle, profile link, and message text**.\n"
                    "- Record screen videos if comments or posts are rapidly disappearing or on stories.\n"
                    "- Save the exact URL of the offending profile and post.\n"
                    "- Export full WhatsApp chat histories (including media) before blocking.\n"
                    "- Store copies on an external USB or secure drive.\n\n"
                    "### Step 2: Use Built-in Platform Safety Tools\n"
                    "- **Instagram:** Tap `...` on comment/post/profile -> `Report` -> `Bullying or harassment` -> Select `Me` or `Someone I know`. "
                    "Use the **Restrict** feature so the bully's comments are only visible to themselves without tipping them off.\n"
                    "- **Facebook:** Tap `Find support or report` -> `Harassment`. Block user profile.\n"
                    "- **X (Twitter):** Tap `...` -> `Report Tweet` -> `Hate speech or Harassment` -> Block account.\n"
                    "- **TikTok:** Long-press video -> `Report` -> `Harassment and bullying`.\n"
                    "- **Snapchat:** Press and hold snap/chat -> `Manage Friendship` -> `Report` / `Block`.\n\n"
                    "### Step 3: Legal & Institutional Reporting in Pakistan\n"
                    "- **Prevention of Electronic Crimes Act (PECA 2016):**\n"
                    "  - *Section 20 (Offences Against Dignity):* Publicly displaying false information to harm reputation: Up to **3 years imprisonment** or **PKR 1 million fine**.\n"
                    "  - *Section 21 (Cyber Stalking):* Following, tracking, or communicating repeatedly to cause distress: Up to **3 years imprisonment** or **PKR 1 million fine**.\n"
                    "  - *Section 24 (Cyber Terrorism/Severe Intimidation):* Severe criminal penalties.\n"
                    "- **FIA NR3C (National Response Centre for Cyber Crime):**\n"
                    "  - Official Online Portal: `complaints.fia.gov.pk`\n"
                    "  - Cybercrime Helpline: **1991**\n"
                    "  - Visit the nearest regional FIA Cyber Crime Circle with preserved digital evidence."
                )
            }
        ],
        "activity": {
            "type": "practical_simulation",
            "title": "Interactive Skill Activity: Evidence Preservation & Response Simulator",
            "instructions": (
                "Review the simulated harassment incident. Complete both parts: verify the 5 critical evidence "
                "requirements on your checklist, then choose the correct response action sequence."
            ),
            "checklist": [
                {
                    "id": "chk_1",
                    "label": "Full-screen screenshot captured including system clock, date, and battery bar.",
                    "required": True
                },
                {
                    "id": "chk_2",
                    "label": "Offender's exact username handle, profile picture, and profile URL recorded.",
                    "required": True
                },
                {
                    "id": "chk_3",
                    "label": "Complete conversation context captured (not just an isolated single line).",
                    "required": True
                },
                {
                    "id": "chk_4",
                    "label": "Unedited evidence files backed up to external storage or cloud drive.",
                    "required": True
                },
                {
                    "id": "chk_5",
                    "label": "Chat export generated with media timestamps before blocking the sender.",
                    "required": True
                }
            ],
            "response_sequence_question": {
                "question": "What is the proper, legally protected sequence of actions when targeted by cyberbullying?",
                "options": [
                    "Retaliate with insults publicly -> Delete account -> Tell nobody",
                    "Preserve full evidence -> Restrict/Block offender -> Report to platform safety -> Escalate to university/FIA if severe",
                    "Immediately delete all chat history -> Block -> Change phone number",
                    "Post a screenshot on your story asking friends to attack the bully"
                ],
                "correct_index": 1,
                "explanation": "Preserving evidence first is mandatory because deleting chats destroys proof. Restricting/blocking stops immediate trauma, platform reporting enforces terms of service, and severe cases must be escalated to authorities."
            }
        }
    },

    4: {
        "module_number": 4,
        "title": "Module 4: Your Role – Peer Dynamics and Social Norms",
        "subtitle": "Bystander Action, Ethical Accountability, and Community Standards",
        "target_construct": "SubjectiveNorm",
        "target_construct_key": "subjective_norm",
        "target_construct_display": "Subjective Norms",
        "estimated_minutes": 20,
        "overview": (
            "This module strengthens subjective norms by exploring how peer expectations and social culture dictate "
            "online behavior. Students explore bystander roles, examine the profound power of active upstanding, "
            "review verified ethical and religious frameworks, and complete an interactive role-picking simulation."
        ),
        "learning_objectives": [
            "Distinguish between the 3 bystander roles: Reinforcer, Outsider, and Upstander.",
            "Understand diffusion of responsibility and how silence fuels perpetrator confidence.",
            "Review verified religious and ethical principles tied directly to modern online actions.",
            "Complete the interactive branching role simulation in a high-stakes campus scenario."
        ],
        "sections": [
            {
                "title": "1. The Social Roles in Cyberbullying",
                "content": (
                    "Cyberbullying is a social phenomenon that depends on an audience. Every person in a group chat plays a role:\n\n"
                    "1. **The Perpetrator:** Initiates hostility, often seeking peer validation, dominance, or attention.\n"
                    "2. **The Victim:** Experiences public humiliation and isolation.\n"
                    "3. **The Reinforcer (Active Accomplice):** Laughs, adds reaction emojis (😂), forwards memes, or comments "
                    "'bro roasted him!'. Perpetrators continue because reinforcers reward them with social approval.\n"
                    "4. **The Outsider (Silent Bystander):** Sees the abuse, feels it is wrong, but says nothing out of fear "
                    "of becoming the next target. **Perpetrators interpret silence as approval; victims interpret silence as abandonment.**\n"
                    "5. **The Upstander (Positive Peer Leader):** Intervenes safely—either publicly setting a standard "
                    "('Hey, let's keep this space respectful') or privately supporting the target and reporting the abuse."
                )
            },
            {
                "title": "2. Breaking Diffusion of Responsibility",
                "content": (
                    "In large university groups of 100+ students, the **Bystander Effect** leads everyone to assume "
                    "'someone else will speak up.' Consequently, nobody acts.\n\n"
                    "Research in social psychology proves that when **just ONE student speaks up**, it shatters the illusion of "
                    "universal consensus and gives courage to dozens of silent peers to step in and reset community standards."
                )
            },
            {
                "title": "3. Religious and Social Perspective (Ethical Framework)",
                "content": (
                    "Islam and universal ethical frameworks place profound emphasis on safeguarding the honor, privacy, "
                    "and dignity of fellow human beings. Below are scholar-reviewed ethical anchor points directly "
                    "connected to modern digital behaviors:\n\n"
                    "> ### [SCHOLAR VERIFICATION REQUIRED — QURANIC REFERENCE ON GOSSIP & MOCKERY]\n"
                    "> **Reference Placeholder:** *Surah Al-Hujurat (49:11)* — Prohibition against mocking other people, defaming one another, and calling each other offensive nicknames.\n"
                    "> **Modern Digital Application:** Creating humiliating stickers from a classmate's face, posting degrading comments on campus confession accounts, or mocking someone's appearance or accent in group chats is a direct violation of this ethical principle.\n\n"
                    "> ### [SCHOLAR VERIFICATION REQUIRED — HADITH REFERENCE ON SPREADING UNVERIFIED NEWS]\n"
                    "> **Reference Placeholder:** *Sahih Muslim* — It is sufficient falsehood for a person that they narrate everything they hear without verification.\n"
                    "> **Modern Digital Application:** Hitting the 'Forward' button on an unverified WhatsApp rumor about a classmate or sharing leaked screenshots makes you an active participant in spreading falsehood.\n\n"
                    "> ### [SCHOLAR VERIFICATION REQUIRED — HADITH PRINCIPLE ON PREVENTING WRONG & HELPING THE OPPRESSED]\n"
                    "> **Reference Placeholder:** *Hadith on changing wrong with one's hand, tongue, or heart (Sahih Muslim)*; *Hadith: 'Help your brother whether he is an oppressor or is being oppressed' (Sahih Bukhari)*.\n"
                    "> **Modern Digital Application:** Upstanding is an active moral duty. Intervening to protect a classmate from digital mobbing or privately checking in on a victim fulfills the mandate of preventing harm and standing with the vulnerable."
                )
            }
        ],
        "activity": {
            "type": "role_scenario",
            "title": "Interactive Role Activity: The Department Chat Poll",
            "instructions": (
                "Read the scenario below. Select your response from the 4 available roles and see the immediate social outcome."
            ),
            "scenario": (
                "In your departmental WhatsApp group of 140 students, a peer creates an anonymous poll titled: "
                "'Who is the most annoying person in our batch?' with the names of three quiet classmates as options. "
                "Within 10 minutes, 20 people have already voted and several laughing emojis have appeared."
            ),
            "roles": [
                {
                    "id": "reinforcer",
                    "role_title": "Role A: The Reinforcer",
                    "action": "Cast a vote in the poll and post a laughing meme sticker.",
                    "outcome": (
                        "⚠️ **Negative Outcome:** Your action validates the poll creator. Seeing another student participate, "
                        "15 more students cast votes. One of the named students leaves the group chat in tears and turns off their phone."
                    ),
                    "is_upstander": False
                },
                {
                    "id": "outsider",
                    "role_title": "Role B: The Silent Outsider",
                    "action": "Read the poll, feel uncomfortable, but mute the group and do nothing.",
                    "outcome": (
                        "⚠️ **Passive Harm Outcome:** Your silence contributes to diffusion of responsibility. The poll creator "
                        "assumes nobody minds. The targeted students see 140 members stay silent and feel completely abandoned by their batch."
                    ),
                    "is_upstander": False
                },
                {
                    "id": "confrontation",
                    "role_title": "Role C: Aggressive Confrontation",
                    "action": "Send angry, abusive messages attacking the poll creator with vulgarity.",
                    "outcome": (
                        "⚠️ **Escalation Outcome:** The situation devolves into a hostile flame war. Other students tell both of you "
                        "to shut up, obscuring the ethical issue and distracting from protecting the targeted students."
                    ),
                    "is_upstander": False
                },
                {
                    "id": "upstander",
                    "role_title": "Role D: The Upstander",
                    "action": (
                        "Post publicly: 'This is an official departmental academic group. Targeting classmates like this is disrespectful "
                        "and unacceptable—admin, please delete this poll.' Then immediately send a private direct message to the named students to offer support."
                    ),
                    "outcome": (
                        "✅ **Positive Transformation Outcome:** Your calm, firm message shatters the bystander effect. Five other classmates "
                        "immediately reply with 'Agreed, delete this.' The admin removes the poll within 2 minutes and issues a warning. "
                        "The targeted student privately thanks you for giving them hope during an agonizing moment."
                    ),
                    "is_upstander": True
                }
            ]
        }
    }
}
