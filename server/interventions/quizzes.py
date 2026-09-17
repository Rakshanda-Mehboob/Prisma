"""
interventions/quizzes.py — Standard structured interactive quizzes for TPB interventions.
"""

import json

ATTITUDE_QUIZ = {
    "title": "Attitude Self-Assessment Quiz",
    "instructions": "Test and reflect on your personal attitudes toward cyberbullying. Choose the best response for each question.",
    "questions": [
        {
            "id": 1,
            "question": "What distinguishes cyberbullying from harmless campus banter?",
            "options": [
                "Any banter between classmates is always acceptable if nobody cries publicly.",
                "Persistent, repetitive, or severe digital actions that humiliate, demean, or distress someone regardless of claimed humor.",
                "Only explicit physical threats written in capital letters count.",
                "Any disagreement in an online academic discussion is cyberbullying."
            ],
            "correct_index": 1,
            "explanation": "Cyberbullying involves hostility, humiliation, or power imbalance. Excusing it as 'just joking' ignores the real psychological harm inflicted on peers."
        },
        {
            "id": 2,
            "question": "If a victim does not openly complain about mockery in a WhatsApp group, what does this indicate?",
            "options": [
                "They are comfortable with the jokes and find them amusing.",
                "Silence often reflects fear of escalation, embarrassment, or lack of safety, not consent.",
                "It is harmless until an instructor or admin officially intervenes.",
                "They secretly enjoy the campus attention."
            ],
            "correct_index": 1,
            "explanation": "Victims frequently stay silent because speaking up can attract more hostility. Silence must never be mistaken for consent."
        },
        {
            "id": 3,
            "question": "What makes cyberbullying psychologically distinct from face-to-face harassment?",
            "options": [
                "It leaves no lasting digital evidence.",
                "It only affects victims when they are actively logged in.",
                "It can occur 24/7, reaches mass audiences instantly, and persists digitally.",
                "It has zero real-world impact on student self-esteem."
            ],
            "correct_index": 2,
            "explanation": "Digital harassment penetrates victims' private safe spaces at any hour and can be viewed or saved by dozens or hundreds within seconds."
        },
        {
            "id": 4,
            "question": "Who shares moral responsibility when a cruel meme targeting a classmate goes viral?",
            "options": [
                "Only the single individual who originally created the meme.",
                "Only the platform algorithms and developers.",
                "The creator, as well as anyone who likes, shares, laughs, or amplifies the degradation.",
                "The victim for posting photos online in the first place."
            ],
            "correct_index": 2,
            "explanation": "Online cruelty thrives on social reinforcement. Forwarding, reacting, or amplifying content directly contributes to the victim's harm."
        }
    ]
}

SUBJECTIVE_NORM_QUIZ = {
    "title": "Social Responsibility Reflection Quiz",
    "instructions": "Evaluate the power of peer dynamics, bystander influence, and social expectations in preventing online abuse.",
    "questions": [
        {
            "id": 1,
            "question": "In the Theory of Planned Behavior, what does 'Subjective Norm' refer to?",
            "options": [
                "The automated content moderation filters of a website.",
                "A student's individual grade point average.",
                "The perceived social pressure and behavioral expectations from friends, peers, and respected authorities.",
                "The average typing speed of students in online discussions."
            ],
            "correct_index": 2,
            "explanation": "Subjective norms reflect social expectations—whether people important to you approve or disapprove of performing a given behavior."
        },
        {
            "id": 2,
            "question": "What is the primary impact of bystander silence in an online harassment thread?",
            "options": [
                "It serves as a neutral signal that calms down the aggressor.",
                "It signals implicit social approval to the bully and intensifies the victim's feeling of abandonment.",
                "It automatically triggers anonymous incident reports.",
                "It protects the entire group from any ethical accountability."
            ],
            "correct_index": 1,
            "explanation": "When onlookers say nothing, bullies interpret silence as permission, and victims feel completely isolated."
        },
        {
            "id": 3,
            "question": "How does the 'Bystander Effect' typically manifest in large university chat groups?",
            "options": [
                "Every student acts immediately because responsibility is shared.",
                "Group members assume someone else will speak up, resulting in nobody taking action.",
                "Large groups naturally eliminate cyberbullying on their own.",
                "Students only pay attention to official administrative notices."
            ],
            "correct_index": 1,
            "explanation": "Diffusion of responsibility causes individuals in large groups to think someone else will step in, leading to total inaction."
        },
        {
            "id": 4,
            "question": "How can an individual student help shift the peer norm in a group where mockery has become common?",
            "options": [
                "Join in with the mockery to keep the mood light and friendly.",
                "Privately encourage the aggressor to be more subtle.",
                "Openly post a respectful boundary (e.g., 'We don't do that here') and reach out to support the target.",
                "Uninstall the chat application and ignore the situation."
            ],
            "correct_index": 2,
            "explanation": "Social norms change when individuals break the silence. Even a single upstander empowers others to reject harassment."
        }
    ]
}

PBC_QUIZ = {
    "title": "Building Your Action Plan — PBC Skills Quiz",
    "instructions": "Test your practical skills, self-efficacy, and confidence in managing and reporting cyberbullying incidents.",
    "questions": [
        {
            "id": 1,
            "question": "Before blocking someone who is harassing you or a classmate, what critical action should you take first?",
            "options": [
                "Reply with aggressive insults to intimidate them.",
                "Take clear screenshots and preserve timestamped digital evidence.",
                "Delete your own account immediately.",
                "Forward the messages to all students in your batch."
            ],
            "correct_index": 1,
            "explanation": "Blocking someone often closes or hides the conversation thread. Preserving evidence with dates, times, and handles is essential for reporting."
        },
        {
            "id": 2,
            "question": "A classmate is being harassed online but dreads reporting due to fear of retaliation. What is the most constructive response?",
            "options": [
                "'Just ignore it and turn off your phone, it is not real life.'",
                "'Reporting is confidential; I will help you document the evidence and accompany you to student affairs.'",
                "'Retaliation is guaranteed, so staying quiet is your best option.'",
                "'You should publicly confront them with equal hostility on social media.'"
            ],
            "correct_index": 1,
            "explanation": "Actionable allyship means validating their safety concerns, explaining confidentiality, and offering collaborative support to reduce anxiety."
        },
        {
            "id": 3,
            "question": "Which built-in digital platform features are most effective for immediate personal protection?",
            "options": [
                "Leaving your account completely public with real-time location tagging.",
                "Changing your profile picture frequently.",
                "Utilizing message filtering, comment restrictions, reporting tools, and privacy controls.",
                "Disabling read receipts only."
            ],
            "correct_index": 2,
            "explanation": "Contemporary platforms provide granular privacy filters, keyword blockers, and reporting channels that give users immediate control over their digital perimeter."
        },
        {
            "id": 4,
            "question": "Why is simply blocking an aggressor rarely a complete solution on its own?",
            "options": [
                "Blocking is technically not permitted under university IT policies.",
                "While blocking shields your individual feed, the aggressor may continue targeting others or create alternate accounts unless reported.",
                "Blocking sends an automated notification to the aggressor's family.",
                "It does not work on modern smartphone apps."
            ],
            "correct_index": 1,
            "explanation": "Blocking is a crucial defensive first step, but institutional reporting is necessary to address the root behavior and protect the wider community."
        }
    ]
}

QUIZ_MAP = {
    "Attitude": json.dumps(ATTITUDE_QUIZ),
    "SubjectiveNorm": json.dumps(SUBJECTIVE_NORM_QUIZ),
    "PBC": json.dumps(PBC_QUIZ),
}
