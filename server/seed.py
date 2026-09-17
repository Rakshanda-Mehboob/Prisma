"""
seed.py — Populate the database with:
  - 48 TPB scenario questions (8 per construct × 3 constructs × 2 stages)
  - 12 intervention modules (4 per construct: video, reading, quiz, case-study)
  - 1 demo user account (email: demo@riphah.edu.pk / password: Demo1234!)

Run ONCE from the server/ directory:
  python seed.py

Safe to re-run — checks for existing data before inserting.

References for scenario content:
  - Ajzen, I. (1991). The theory of planned behavior. OBHDP, 50(2), 179-211.
  - Hinduja, S. & Patchin, J.W. (2010). Cyberbullying & Self-Esteem. J School Health.
  - Bandura, A. (1986). Social Foundations of Thought and Action. Prentice-Hall.
"""

import sys
import os

# Ensure the server/ directory is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
import models
from interventions.quizzes import QUIZ_MAP

# Create tables if they don't exist yet
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()


# ═══════════════════════════════════════════════════════════════════════════════
# SCENARIO DATA
# Each scenario: construct, stage, scenario_text, question_text
# Each has 5 options with scores 5→1 (most positive → most negative attitude)
# ═══════════════════════════════════════════════════════════════════════════════

SCENARIOS = [

    # ──────────────────────────────────────────────────────────────────────────
    # ATTITUDE — PRE  (assessing current attitude toward cyberbullying)
    # ──────────────────────────────────────────────────────────────────────────
    {
        "construct": "Attitude",
        "stage": "pre",
        "scenario_text": (
            "Sana notices that her classmate Zara has been posting mocking comments "
            "about another student's appearance in a WhatsApp group of 80 students. "
            "Zara says she is 'just joking around.'"
        ),
        "question_text": "How would you describe Zara's behavior?",
        "options": [
            ("Completely unacceptable — this is cyberbullying regardless of intent.", 5),
            ("Wrong — jokes that humiliate others publicly are harmful.", 4),
            ("Unclear — it depends on whether the target finds it funny.", 3),
            ("Minor issue — it's just banter between classmates.", 2),
            ("Acceptable — social media humor is normal and harmless.", 1),
        ],
    },
    {
        "construct": "Attitude",
        "stage": "pre",
        "scenario_text": (
            "Ali discovers that someone has created a fake Instagram account using "
            "his classmate's photos and name to post embarrassing content."
        ),
        "question_text": "How serious do you consider this action?",
        "options": [
            ("Extremely serious — this is identity theft and severe cyberbullying.", 5),
            ("Very serious — it causes real psychological harm.", 4),
            ("Moderately serious — it depends on the content posted.", 3),
            ("Slightly concerning — but the real person can just ignore it.", 2),
            ("Not a big deal — it happens online all the time.", 1),
        ],
    },
    {
        "construct": "Attitude",
        "stage": "pre",
        "scenario_text": (
            "A group of university students deliberately excludes one person from all "
            "class-related online groups and chats, leaving them unable to receive "
            "important updates or participate in group work."
        ),
        "question_text": "In your view, this type of online exclusion is:",
        "options": [
            ("A serious form of cyberbullying that causes real academic and social harm.", 5),
            ("Harmful — deliberately isolating someone is wrong.", 4),
            ("Depends — sometimes group dynamics make exclusion unavoidable.", 3),
            ("Minor — the person can find information from other sources.", 2),
            ("Normal — groups have the right to decide who joins them.", 1),
        ],
    },
    {
        "construct": "Attitude",
        "stage": "pre",
        "scenario_text": (
            "During an online gaming session, a player relentlessly sends threatening "
            "and insulting messages to another player who made a mistake."
        ),
        "question_text": "How do you evaluate this behavior?",
        "options": [
            ("It is harassment and cyberbullying — gaming platforms are not exempt.", 5),
            ("Wrong — criticism is fine but personal threats are unacceptable.", 4),
            ("Gray area — competitive gaming culture can be intense.", 3),
            ("Overreacted to — players should expect trash talk in competitive games.", 2),
            ("Normal — it's just part of online gaming culture.", 1),
        ],
    },
    {
        "construct": "Attitude",
        "stage": "pre",
        "scenario_text": (
            "Screenshots of a private conversation between two friends are shared "
            "publicly in a university group chat without either person's consent."
        ),
        "question_text": "Sharing private conversations without consent is:",
        "options": [
            ("A serious breach of trust and a form of cyberbullying.", 5),
            ("Wrong — private conversations should remain private.", 4),
            ("Questionable — it depends on the content of the conversation.", 3),
            ("Minor — if there's nothing embarrassing it's not harmful.", 2),
            ("Acceptable — don't say anything online you wouldn't want shared.", 1),
        ],
    },
    {
        "construct": "Attitude",
        "stage": "pre",
        "scenario_text": (
            "A student posts false academic rumors about a classmate to damage their "
            "reputation before final exams, hoping to reduce competition."
        ),
        "question_text": "How would you rate this behavior ethically?",
        "options": [
            ("Completely unethical — this is deliberate harm and academic dishonesty.", 5),
            ("Very wrong — spreading false information is always harmful.", 4),
            ("Wrong, but competitive academic environments create such pressures.", 3),
            ("Minor ethical issue — everyone is competitive during exams.", 2),
            ("Not a moral concern — it's a competitive world.", 1),
        ],
    },
    {
        "construct": "Attitude",
        "stage": "pre",
        "scenario_text": (
            "An anonymous account consistently comments negatively on every post "
            "made by a specific student, targeting their looks, intelligence, and family."
        ),
        "question_text": "Targeted anonymous harassment like this is:",
        "options": [
            ("A serious form of cyberbullying that can cause lasting psychological trauma.", 5),
            ("Very harmful — anonymity does not excuse cruelty.", 4),
            ("Harmful but hard to stop — anonymity is a real challenge.", 3),
            ("Unpleasant but the target can simply ignore the account.", 2),
            ("Something the target should learn to deal with online.", 1),
        ],
    },
    {
        "construct": "Attitude",
        "stage": "pre",
        "scenario_text": (
            "A video that captures an embarrassing moment of a student at a party "
            "is shared widely on TikTok without the student's knowledge or consent."
        ),
        "question_text": "Sharing this video without consent is:",
        "options": [
            ("A serious violation of privacy and a harmful act of cyberbullying.", 5),
            ("Wrong — the person's dignity and privacy have been violated.", 4),
            ("Depends — if the video is 'funny' it might be considered harmless sharing.", 3),
            ("A minor issue if the moment itself wasn't too embarrassing.", 2),
            ("Fine — if you attend a party, you accept that moments might be shared.", 1),
        ],
    },

    # ──────────────────────────────────────────────────────────────────────────
    # SUBJECTIVE NORM — PRE (assessing perceived social pressure)
    # ──────────────────────────────────────────────────────────────────────────
    {
        "construct": "SubjectiveNorm",
        "stage": "pre",
        "scenario_text": (
            "Most of your close friends have decided to report a cyberbullying incident "
            "they witnessed in a university Facebook group to the group admin."
        ),
        "question_text": "How much does your social circle's action influence your own decision about reporting?",
        "options": [
            ("Strongly — if my peers act against bullying, I absolutely feel motivated to as well.", 5),
            ("Quite a bit — social norms in my group do shape my behavior.", 4),
            ("Somewhat — I consider my peers but ultimately decide independently.", 3),
            ("A little — I prefer to make my own decisions regardless of peers.", 2),
            ("Not at all — I do what I want regardless of what others do.", 1),
        ],
    },
    {
        "construct": "SubjectiveNorm",
        "stage": "pre",
        "scenario_text": (
            "Your family has always emphasized treating others with respect, both online "
            "and offline. Your parents would be disappointed if you participated in "
            "any form of cyberbullying."
        ),
        "question_text": "How much does your family's expectation influence your online behavior?",
        "options": [
            ("Very strongly — my family's values are deeply embedded in how I act online.", 5),
            ("Quite a lot — I consider what my family would think before posting.", 4),
            ("Moderately — I try to align with family values but I also think independently.", 3),
            ("A little — family opinions have some but limited influence online.", 2),
            ("Not at all — my online behavior is entirely my own decision.", 1),
        ],
    },
    {
        "construct": "SubjectiveNorm",
        "stage": "pre",
        "scenario_text": (
            "A widely respected student leader at your university publicly speaks out "
            "against cyberbullying and encourages everyone to stand up for victims."
        ),
        "question_text": "How much does this leader's stance affect your own attitude and behavior?",
        "options": [
            ("Significantly — respected role models strongly shape my values.", 5),
            ("Considerably — I look up to campus leaders and their positions matter.", 4),
            ("Somewhat — it reinforces values I already hold.", 3),
            ("A little — I respect them but form my own views.", 2),
            ("Not at all — public figures don't influence my personal choices.", 1),
        ],
    },
    {
        "construct": "SubjectiveNorm",
        "stage": "pre",
        "scenario_text": (
            "You notice that in your university's online community, cyberbullying is "
            "openly condemned and people who engage in it are socially excluded."
        ),
        "question_text": "How does this social norm in your community affect your own behavior?",
        "options": [
            ("It strongly reinforces my commitment to never engage in cyberbullying.", 5),
            ("It positively influences me — community standards matter.", 4),
            ("It has some effect — I naturally align with positive social norms.", 3),
            ("Minimal effect — I would behave the same regardless of community norms.", 2),
            ("No effect — community opinion does not change what I would do.", 1),
        ],
    },
    {
        "construct": "SubjectiveNorm",
        "stage": "pre",
        "scenario_text": (
            "Your university has introduced an official anti-cyberbullying policy and "
            "most faculty members actively promote a culture of digital respect."
        ),
        "question_text": "How does institutional policy affect your personal commitment to avoiding cyberbullying?",
        "options": [
            ("Very strongly — official institutional stances set important expectations.", 5),
            ("Considerably — I respect and align with institutional policies.", 4),
            ("Moderately — policies remind me of the importance of this issue.", 3),
            ("Slightly — policies exist but personal values are what truly guide me.", 2),
            ("Not at all — policies have no impact on my actual behavior.", 1),
        ],
    },
    {
        "construct": "SubjectiveNorm",
        "stage": "pre",
        "scenario_text": (
            "In a class discussion about online ethics, your professor and peers all agree "
            "that being a bystander who does nothing about cyberbullying is also harmful."
        ),
        "question_text": "Does this consensus change how you view bystander inaction?",
        "options": [
            ("Yes, significantly — this makes me feel personally responsible to act.", 5),
            ("Yes, quite a bit — group consensus reflects an important social truth.", 4),
            ("Somewhat — I already felt this way but the discussion reinforced it.", 3),
            ("A little — it gives me something to think about.", 2),
            ("No — I already had my own view and this doesn't change it.", 1),
        ],
    },
    {
        "construct": "SubjectiveNorm",
        "stage": "pre",
        "scenario_text": (
            "Your best friend confides that they have been a victim of cyberbullying "
            "and asks whether you think people around them should have intervened."
        ),
        "question_text": "How does your friend's experience shape your view of social responsibility?",
        "options": [
            ("It strongly reinforces my belief that bystanders must always act.", 5),
            ("It makes me feel that intervention by peers is crucial.", 4),
            ("It shows the importance of peer support, though situations vary.", 3),
            ("It's sad but I'm not sure bystanders can always do much.", 2),
            ("Personal problems are best handled privately — bystanders shouldn't interfere.", 1),
        ],
    },
    {
        "construct": "SubjectiveNorm",
        "stage": "pre",
        "scenario_text": (
            "A viral social media campaign against cyberbullying has been shared "
            "tens of thousands of times, with many of your contacts participating."
        ),
        "question_text": "How does widespread peer participation in this campaign affect your stance?",
        "options": [
            ("It strongly motivates me — collective action shows these norms are widely shared.", 5),
            ("It encourages me to also take a public stand against cyberbullying.", 4),
            ("It has some influence — social movements do reflect genuine values.", 3),
            ("Little influence — I support the cause privately but not publicly.", 2),
            ("No influence — viral campaigns are superficial and don't reflect real change.", 1),
        ],
    },

    # ──────────────────────────────────────────────────────────────────────────
    # PBC — PRE (assessing perceived behavioral control)
    # ──────────────────────────────────────────────────────────────────────────
    {
        "construct": "PBC",
        "stage": "pre",
        "scenario_text": (
            "You witness a classmate being publicly shamed in a university online group. "
            "You have the ability to comment, report, or message the victim privately."
        ),
        "question_text": "How confident are you in your ability to take effective action in this situation?",
        "options": [
            ("Very confident — I know exactly what to do and would act immediately.", 5),
            ("Confident — I would likely intervene in an appropriate way.", 4),
            ("Somewhat confident — I would try to help but might not know the best approach.", 3),
            ("Not very confident — I'd want to help but fear making things worse.", 2),
            ("Not confident at all — I wouldn't know what to do or feel too afraid to act.", 1),
        ],
    },
    {
        "construct": "PBC",
        "stage": "pre",
        "scenario_text": (
            "You receive a message asking you to join a hate group targeting a specific "
            "student. You know that declining might result in social pressure from the group."
        ),
        "question_text": "How capable do you feel of refusing and standing against peer pressure in this case?",
        "options": [
            ("Completely capable — I would decline firmly regardless of social pressure.", 5),
            ("Mostly capable — I am confident I would refuse even if pressured.", 4),
            ("Somewhat capable — I hope I would refuse but peer pressure is difficult.", 3),
            ("Not very capable — social pressure is hard to resist in my social circle.", 2),
            ("Not capable — I would likely go along to avoid conflict and exclusion.", 1),
        ],
    },
    {
        "construct": "PBC",
        "stage": "pre",
        "scenario_text": (
            "You are aware that your university has a formal cyberbullying reporting system, "
            "but you are unsure how to use it or whether reports are kept confidential."
        ),
        "question_text": "How capable do you feel of formally reporting a cyberbullying incident?",
        "options": [
            ("Very capable — I would find out how to use the system and report confidently.", 5),
            ("Capable — I would navigate the process and report despite uncertainty.", 4),
            ("Somewhat capable — I'd try but the process feels unclear to me.", 3),
            ("Not very capable — the complexity of the process discourages me.", 2),
            ("Not capable at all — I wouldn't know where to start or be too afraid of retaliation.", 1),
        ],
    },
    {
        "construct": "PBC",
        "stage": "pre",
        "scenario_text": (
            "A friend asks for your help because they are experiencing cyberbullying. "
            "You want to support them but aren't sure of the best approach."
        ),
        "question_text": "How confident are you in your ability to provide meaningful support?",
        "options": [
            ("Very confident — I have the knowledge and empathy to help effectively.", 5),
            ("Confident — I would listen, validate their experience, and guide them to resources.", 4),
            ("Somewhat confident — I'd try my best but might not know all the right steps.", 3),
            ("Not very confident — I'd want to help but might say the wrong thing.", 2),
            ("Not confident — I feel I lack the knowledge to handle this situation.", 1),
        ],
    },
    {
        "construct": "PBC",
        "stage": "pre",
        "scenario_text": (
            "You want to speak to a cyberbully directly and tell them their behavior "
            "is harmful, but you worry about potential conflict or retaliation."
        ),
        "question_text": "How capable do you feel of having this difficult conversation?",
        "options": [
            ("Very capable — I would address it calmly and directly.", 5),
            ("Capable — I'd find an appropriate moment and approach it constructively.", 4),
            ("Somewhat capable — I'd try but might struggle to stay calm under pressure.", 3),
            ("Not very capable — confrontation is difficult for me even when necessary.", 2),
            ("Not capable — fear of conflict or retaliation would prevent me from acting.", 1),
        ],
    },
    {
        "construct": "PBC",
        "stage": "pre",
        "scenario_text": (
            "You want to protect your own privacy online to avoid becoming a target "
            "of cyberbullying, but you're unsure of what privacy settings or behaviors "
            "are most effective."
        ),
        "question_text": "How confident are you in your ability to protect your own digital safety?",
        "options": [
            ("Very confident — I understand privacy settings and digital hygiene well.", 5),
            ("Confident — I manage my online presence and privacy effectively.", 4),
            ("Somewhat confident — I know the basics but there's much I'm still learning.", 3),
            ("Not very confident — I find privacy settings confusing.", 2),
            ("Not confident — I don't know how to protect myself online effectively.", 1),
        ],
    },
    {
        "construct": "PBC",
        "stage": "pre",
        "scenario_text": (
            "You witness a public post that you believe crosses the line into cyberbullying. "
            "You can block, report, or screenshot it as evidence."
        ),
        "question_text": "How capable do you feel of using platform tools effectively to respond?",
        "options": [
            ("Very capable — I know how to use block, report, and evidence-gathering features.", 5),
            ("Capable — I'd figure out the platform features and use them appropriately.", 4),
            ("Somewhat capable — I know some features but might need to look up how to report.", 3),
            ("Not very capable — I find reporting features confusing or ineffective.", 2),
            ("Not capable at all — I don't know how to use these tools.", 1),
        ],
    },
    {
        "construct": "PBC",
        "stage": "pre",
        "scenario_text": (
            "After witnessing repeated cyberbullying of the same student, you want to "
            "organize a peer support initiative among your classmates."
        ),
        "question_text": "How capable do you feel of leading a peer-based anti-cyberbullying effort?",
        "options": [
            ("Very capable — I have the leadership skills and motivation to organize this.", 5),
            ("Capable — I'd gather support from friends and take meaningful steps.", 4),
            ("Somewhat capable — I'd like to but organizing others is challenging.", 3),
            ("Not very capable — I wouldn't know how to get peers to take this seriously.", 2),
            ("Not capable — I don't feel I have the influence or skills to lead this.", 1),
        ],
    },

    # ──────────────────────────────────────────────────────────────────────────
    # ATTITUDE — POST  (different wording, same construct — measures change)
    # ──────────────────────────────────────────────────────────────────────────
    {
        "construct": "Attitude",
        "stage": "post",
        "scenario_text": (
            "After completing your learning modules, you observe a student posting "
            "repeated sarcastic comments about a classmate's academic performance "
            "in an online study group."
        ),
        "question_text": "Reflecting on what you've learned, how do you now evaluate this behavior?",
        "options": [
            ("Clearly harmful cyberbullying — sarcastic repetition is a form of harassment.", 5),
            ("Wrong — even subtle repeated negativity causes real harm.", 4),
            ("Depends on whether the comments are constructive or purely mocking.", 3),
            ("Minor — academic competition sometimes involves harsh feedback.", 2),
            ("Acceptable — criticism in study groups is normal and healthy.", 1),
        ],
    },
    {
        "construct": "Attitude",
        "stage": "post",
        "scenario_text": (
            "A student receives threatening private messages from an anonymous account "
            "warning them to 'back off' from a social group. They show you the messages."
        ),
        "question_text": "How do you now view private threatening messages as a form of cyberbullying?",
        "options": [
            ("A very serious form of cyberbullying that constitutes intimidation and harassment.", 5),
            ("Serious — threatening messages cause fear and psychological harm.", 4),
            ("Moderately serious — it depends on how credible the threats are.", 3),
            ("Somewhat concerning — anonymous messages can usually be ignored.", 2),
            ("Minor — it's easy to block and move on.", 1),
        ],
    },
    {
        "construct": "Attitude",
        "stage": "post",
        "scenario_text": (
            "A classmate jokes that 'cyberbullying isn't as bad as real bullying because "
            "you can just turn off your phone.' You are asked your opinion."
        ),
        "question_text": "Based on what you have learned, how do you respond to this view?",
        "options": [
            ("I strongly disagree — cyberbullying can be 24/7 and is often harder to escape.", 5),
            ("I disagree — digital harassment causes serious psychological harm.", 4),
            ("There is some truth but it oversimplifies the impact of cyberbullying.", 3),
            ("I partially agree — online harassment is generally less severe than physical bullying.", 2),
            ("I agree — turning off devices is always a viable option.", 1),
        ],
    },
    {
        "construct": "Attitude",
        "stage": "post",
        "scenario_text": (
            "You see a student who was previously cyberbullied now publicly sharing "
            "their experience as part of a university awareness campaign."
        ),
        "question_text": "How do you now perceive the long-term impact cyberbullying has on victims?",
        "options": [
            ("Very significant — cyberbullying causes lasting trauma that affects mental health and academic life.", 5),
            ("Significant — it leaves lasting marks even after the harassment stops.", 4),
            ("Moderate — effects vary greatly depending on the individual.", 3),
            ("Limited — most people recover from online harassment relatively quickly.", 2),
            ("Minimal — resilient individuals are largely unaffected long-term.", 1),
        ],
    },
    {
        "construct": "Attitude",
        "stage": "post",
        "scenario_text": (
            "A popular student uses their platform to publicly mock a less popular student's "
            "fashion choices, and their followers join in the mockery."
        ),
        "question_text": "How do you view the role of influence and power in cyberbullying?",
        "options": [
            ("Power dynamics make this worse — influential people causing harm is a serious abuse.", 5),
            ("Harmful — using social status to bully is especially wrong.", 4),
            ("Somewhat concerning — popularity creates responsibility but people make mistakes.", 3),
            ("Depends — popular students are often just engaging in trending humor.", 2),
            ("Normal — social hierarchies exist and this is part of online culture.", 1),
        ],
    },
    {
        "construct": "Attitude",
        "stage": "post",
        "scenario_text": (
            "Reflecting on your learning modules, you think about whether you have ever "
            "unintentionally participated in behavior that could be considered cyberbullying."
        ),
        "question_text": "How do you now evaluate the importance of self-reflection in online behavior?",
        "options": [
            ("Extremely important — self-reflection is essential to being a responsible digital citizen.", 5),
            ("Very important — we all have blind spots and must regularly assess our behavior.", 4),
            ("Moderately important — occasional self-assessment is valuable.", 3),
            ("Somewhat important — but most people know when they've crossed a line.", 2),
            ("Not particularly important — good intentions are enough.", 1),
        ],
    },
    {
        "construct": "Attitude",
        "stage": "post",
        "scenario_text": (
            "A university policy proposes mandatory digital literacy training for all "
            "students specifically focused on cyberbullying prevention."
        ),
        "question_text": "How do you now view the importance of such formal education initiatives?",
        "options": [
            ("Very important — structured education is essential for meaningful behavioral change.", 5),
            ("Important — formal training builds awareness that informal learning misses.", 4),
            ("Moderately important — useful for some but not all students need it.", 3),
            ("Somewhat important — awareness exists but formal training seems excessive.", 2),
            ("Unnecessary — most students already know right from wrong online.", 1),
        ],
    },
    {
        "construct": "Attitude",
        "stage": "post",
        "scenario_text": (
            "After completing the intervention, you consider whether cyberbullying should "
            "carry formal academic consequences (e.g., suspension) at universities."
        ),
        "question_text": "How do you now view formal institutional consequences for cyberbullying?",
        "options": [
            ("Strongly in favor — formal consequences signal that institutions take this seriously.", 5),
            ("In favor — consequences are necessary to deter harmful behavior.", 4),
            ("Mixed — consequences depend heavily on severity and context.", 3),
            ("Cautious — formal consequences risk being disproportionate.", 2),
            ("Against — cyberbullying should be handled socially, not institutionally.", 1),
        ],
    },

    # ──────────────────────────────────────────────────────────────────────────
    # SUBJECTIVE NORM — POST
    # ──────────────────────────────────────────────────────────────────────────
    {
        "construct": "SubjectiveNorm",
        "stage": "post",
        "scenario_text": (
            "After the intervention, you observe that more peers are openly speaking up "
            "about cyberbullying in your university's online spaces."
        ),
        "question_text": "How does seeing more peers take active anti-cyberbullying stances affect your motivation?",
        "options": [
            ("It strongly motivates me — positive social norms are contagious and powerful.", 5),
            ("It encourages me — seeing peers act makes it easier for me to act too.", 4),
            ("It's somewhat motivating — it validates what I already believed.", 3),
            ("Little effect — I was already committed regardless of others.", 2),
            ("No effect — peer behavior doesn't change what I personally do.", 1),
        ],
    },
    {
        "construct": "SubjectiveNorm",
        "stage": "post",
        "scenario_text": (
            "You reflect on how your immediate social circle would now react if they saw "
            "you participating in or ignoring an incident of cyberbullying."
        ),
        "question_text": "How much does anticipated social judgment from your peers shape your intended behavior?",
        "options": [
            ("Significantly — I care deeply about how my peers perceive my ethical choices.", 5),
            ("Quite a lot — social accountability is a real motivator for me.", 4),
            ("Moderately — peer opinion matters but is one of several factors.", 3),
            ("A little — I prefer to act on my personal values rather than peer pressure.", 2),
            ("Not at all — I am completely indifferent to peer judgment.", 1),
        ],
    },
    {
        "construct": "SubjectiveNorm",
        "stage": "post",
        "scenario_text": (
            "A respected academic mentor in your department tells you that they expect "
            "students to be proactive digital citizens who challenge cyberbullying."
        ),
        "question_text": "How much does this mentor's expectation influence your sense of responsibility?",
        "options": [
            ("Very much — mentors play a powerful role in shaping my values and behaviors.", 5),
            ("Quite a lot — I hold mentors in high regard and take their expectations seriously.", 4),
            ("Somewhat — it aligns with values I'm developing independently.", 3),
            ("A little — I respect them but make my own ethical choices.", 2),
            ("Not at all — my behavior is entirely self-determined.", 1),
        ],
    },
    {
        "construct": "SubjectiveNorm",
        "stage": "post",
        "scenario_text": (
            "You learn that universities which cultivate strong anti-cyberbullying social "
            "norms report significantly lower rates of online harassment among students."
        ),
        "question_text": "How does this finding affect your view of the power of social norms in your community?",
        "options": [
            ("It strongly reinforces my belief that building positive norms is essential.", 5),
            ("It confirms that collective social standards have real, measurable impact.", 4),
            ("It's interesting and moderately persuasive evidence.", 3),
            ("Somewhat relevant — norms help but individual values matter more.", 2),
            ("Not particularly convincing — I don't think norms drive individual behavior.", 1),
        ],
    },
    {
        "construct": "SubjectiveNorm",
        "stage": "post",
        "scenario_text": (
            "Your university introduces peer ambassador roles where students are trained "
            "to model anti-cyberbullying behavior and support victims."
        ),
        "question_text": "How much would visible peer leadership on this issue influence your own actions?",
        "options": [
            ("Very much — peer leaders who model values create lasting cultural change.", 5),
            ("Quite a bit — visible positive role models are highly motivating.", 4),
            ("Somewhat — it would reinforce my existing commitment.", 3),
            ("A little — I appreciate the initiative but act based on my own values.", 2),
            ("Not at all — peer leaders don't change my personal behavior.", 1),
        ],
    },
    {
        "construct": "SubjectiveNorm",
        "stage": "post",
        "scenario_text": (
            "You realize that several students in your friend group were unaware of "
            "how harmful certain behaviors they considered 'jokes' actually are."
        ),
        "question_text": "How does this realization affect your sense of responsibility to educate peers?",
        "options": [
            ("Greatly — I now feel personally responsible to share what I've learned.", 5),
            ("Considerably — I would proactively talk to my friends about these issues.", 4),
            ("Moderately — I might mention it if the topic comes up naturally.", 3),
            ("A little — I'd be happy to discuss it but wouldn't go out of my way.", 2),
            ("Not at all — it's not my place to change my peers' views.", 1),
        ],
    },
    {
        "construct": "SubjectiveNorm",
        "stage": "post",
        "scenario_text": (
            "After the learning program, you consider how online communities can "
            "collectively create and enforce expectations of digital kindness and respect."
        ),
        "question_text": "How do you now view the role of collective community standards in preventing cyberbullying?",
        "options": [
            ("Critical — community standards are the most powerful deterrent to cyberbullying.", 5),
            ("Very important — shared norms shape behavior more effectively than individual actions.", 4),
            ("Important — community standards help but individual ethics are equally key.", 3),
            ("Moderately important — community standards vary too widely to be reliable.", 2),
            ("Less important — cyberbullying is fundamentally an individual behavior problem.", 1),
        ],
    },
    {
        "construct": "SubjectiveNorm",
        "stage": "post",
        "scenario_text": (
            "A survey of your university cohort reveals that 85% of students now consider "
            "actively intervening in cyberbullying incidents a social responsibility."
        ),
        "question_text": "How does knowing this majority view affect your own commitment to intervening?",
        "options": [
            ("It strongly strengthens my commitment — I align with this majority social responsibility.", 5),
            ("It reinforces my commitment — knowing the majority shares my view is validating.", 4),
            ("Somewhat — I was already committed but this further confirms it.", 3),
            ("Little — I make ethical choices independently of majority opinion.", 2),
            ("No effect — majority views don't determine right or wrong for me.", 1),
        ],
    },

    # ──────────────────────────────────────────────────────────────────────────
    # PBC — POST
    # ──────────────────────────────────────────────────────────────────────────
    {
        "construct": "PBC",
        "stage": "post",
        "scenario_text": (
            "After completing your learning modules, you encounter a cyberbullying "
            "situation in an online group. You now have more knowledge about how to respond."
        ),
        "question_text": "How confident do you now feel in your ability to take effective action?",
        "options": [
            ("Very confident — my learning has given me both the knowledge and confidence to act.", 5),
            ("Confident — I now know the right steps and would act appropriately.", 4),
            ("Somewhat confident — more informed than before but still uncertain in the moment.", 3),
            ("Not very confident — theoretical knowledge doesn't fully prepare me.", 2),
            ("Not confident — I still feel unable to act even after learning.", 1),
        ],
    },
    {
        "construct": "PBC",
        "stage": "post",
        "scenario_text": (
            "You now understand the psychological impact of cyberbullying on victims. "
            "A friend tells you they have been experiencing online harassment."
        ),
        "question_text": "How capable do you now feel of providing effective emotional support?",
        "options": [
            ("Very capable — I know how to listen empathetically and connect them with resources.", 5),
            ("Capable — I have the skills to provide meaningful emotional support.", 4),
            ("Somewhat capable — I'd do my best with the knowledge I've gained.", 3),
            ("Not very capable — supporting victims requires more than I've learned.", 2),
            ("Not capable — I still feel inadequate to handle this.", 1),
        ],
    },
    {
        "construct": "PBC",
        "stage": "post",
        "scenario_text": (
            "You want to report a cyberbullying incident through your university's official "
            "reporting portal. You explored this process during your learning modules."
        ),
        "question_text": "How capable do you now feel of successfully navigating the reporting process?",
        "options": [
            ("Very capable — I understand the process and would complete it confidently.", 5),
            ("Capable — I know enough to report effectively.", 4),
            ("Somewhat capable — I have a better idea now but might still need guidance.", 3),
            ("Not very capable — the process still seems complex.", 2),
            ("Not capable — I still wouldn't know how to report effectively.", 1),
        ],
    },
    {
        "construct": "PBC",
        "stage": "post",
        "scenario_text": (
            "You feel inspired to create a brief awareness post about cyberbullying "
            "prevention for your university's social media page."
        ),
        "question_text": "How capable do you feel of creating and sharing meaningful awareness content?",
        "options": [
            ("Very capable — I can confidently create and share impactful awareness content.", 5),
            ("Capable — I have the knowledge and confidence to create useful content.", 4),
            ("Somewhat capable — I'd try but worry about whether it will make an impact.", 3),
            ("Not very capable — I lack confidence in my ability to communicate this effectively.", 2),
            ("Not capable — this is beyond what I feel able to do.", 1),
        ],
    },
    {
        "construct": "PBC",
        "stage": "post",
        "scenario_text": (
            "A situation arises where you need to confront a friend about online behavior "
            "that you now recognize as a form of cyberbullying."
        ),
        "question_text": "How capable do you now feel of having this difficult but necessary conversation?",
        "options": [
            ("Very capable — I can address it assertively and with empathy.", 5),
            ("Capable — I know how to frame this conversation constructively.", 4),
            ("Somewhat capable — I have more tools than before but it's still difficult.", 3),
            ("Not very capable — even with knowledge, confrontation is hard for me.", 2),
            ("Not capable — I still couldn't bring myself to confront a friend.", 1),
        ],
    },
    {
        "construct": "PBC",
        "stage": "post",
        "scenario_text": (
            "You want to implement better digital privacy practices to protect yourself "
            "and your peers from potential cyberbullying situations."
        ),
        "question_text": "How confident are you now in your ability to manage your digital safety effectively?",
        "options": [
            ("Very confident — I now understand and can implement strong privacy practices.", 5),
            ("Confident — I have actionable knowledge about digital safety.", 4),
            ("Somewhat confident — I know more than before but still learning.", 3),
            ("Not very confident — digital privacy still feels complex.", 2),
            ("Not confident — I feel no more capable than before.", 1),
        ],
    },
    {
        "construct": "PBC",
        "stage": "post",
        "scenario_text": (
            "You want to mentor younger students about cyberbullying prevention, "
            "sharing the knowledge and awareness you've built through this program."
        ),
        "question_text": "How capable do you feel of teaching and mentoring others on this topic?",
        "options": [
            ("Very capable — I feel equipped and motivated to share this knowledge.", 5),
            ("Capable — I could mentor younger students meaningfully.", 4),
            ("Somewhat capable — I could share basics but would feel underprepared for complex questions.", 3),
            ("Not very capable — I'm still building my own understanding.", 2),
            ("Not capable — I don't feel ready to teach others.", 1),
        ],
    },
    {
        "construct": "PBC",
        "stage": "post",
        "scenario_text": (
            "Reflecting on the entire learning journey, you consider your overall "
            "readiness to be an active bystander and upstander against cyberbullying."
        ),
        "question_text": "How would you now rate your overall capability to respond to cyberbullying effectively?",
        "options": [
            ("Very high — I am well-prepared and committed to being an active upstander.", 5),
            ("High — I have the knowledge, skills, and motivation to respond effectively.", 4),
            ("Moderate — I am significantly more capable than before but still growing.", 3),
            ("Low — I have more awareness but still lack the confidence to act.", 2),
            ("Very low — the program didn't substantially improve my capability.", 1),
        ],
    },
]


# ═══════════════════════════════════════════════════════════════════════════════
# INTERVENTION DATA
# 4 interventions per construct: reading, video, case-study, quiz
# ═══════════════════════════════════════════════════════════════════════════════

INTERVENTIONS = [

    # ── ATTITUDE Interventions ──────────────────────────────────────────────

    {
        "target_construct": "Attitude",
        "title": "Understanding the Real Impact of Cyberbullying",
        "content_type": "reading",
        "content_body": (
            "# Understanding the Real Impact of Cyberbullying\n\n"
            "## What Is Cyberbullying?\n"
            "Cyberbullying is defined as repeated, intentional harm inflicted through digital "
            "devices. Unlike face-to-face bullying, cyberbullying can occur 24/7, reach large "
            "audiences instantly, and feel inescapable for victims.\n\n"
            "## The Psychological Toll\n"
            "Research consistently shows that cyberbullying victims experience:\n"
            "- **Increased anxiety and depression**: Victims report significantly higher rates of "
            "clinical anxiety and depressive episodes.\n"
            "- **Academic decline**: A 2020 meta-analysis found that cyberbullied students show "
            "measurable drops in GPA and class participation.\n"
            "- **Sleep disturbance**: 68% of victims report chronic sleep issues due to constant "
            "checking of devices for new attacks.\n"
            "- **Social withdrawal**: Many victims reduce real-world social interactions.\n\n"
            "## The Myth of 'Just Log Off'\n"
            "Telling victims to 'just turn off their phone' ignores reality. Social media and "
            "messaging apps are deeply embedded in academic coordination, social life, and "
            "professional networking. Disconnecting has real academic and social costs.\n\n"
            "## What Research Shows About Attitudes\n"
            "Studies using the Theory of Planned Behavior (Ajzen, 1991) show that students who "
            "clearly recognize cyberbullying as harmful are significantly less likely to engage in "
            "it and significantly more likely to intervene as bystanders.\n\n"
            "## Reflection Exercise\n"
            "Think of a time you witnessed online behavior that made someone uncomfortable. "
            "How did you respond? What would you do differently now?\n\n"
            "*Sources: Hinduja & Patchin (2010); Smith et al. (2008); Kowalski & Limber (2013)*"
        ),
        "estimated_minutes": 12,
    },
    {
        "target_construct": "Attitude",
        "title": "Voices of Victims: Cyberbullying Stories",
        "content_type": "video",
        "content_body": (
            "https://www.youtube.com/watch?v=mNm06iKqvMk\n\n"
            "**Watch Time: ~10 minutes**\n\n"
            "This documentary-style video features real young people sharing their experiences "
            "as victims of cyberbullying. As you watch, pay attention to:\n"
            "- The emotional language they use to describe the experience\n"
            "- The lasting effects on their confidence and academic performance\n"
            "- The role that bystanders played — positively and negatively\n\n"
            "After watching, reflect: Did any story change or deepen your understanding of how "
            "cyberbullying feels from the inside?"
        ),
        "estimated_minutes": 12,
    },
    {
        "target_construct": "Attitude",
        "title": "Case Study: The Ripple Effects of Online Mockery",
        "content_type": "case-study",
        "content_body": (
            "# Case Study: The Ripple Effects of Online Mockery\n\n"
            "**Background**\n"
            "Hira, a second-year university student, began receiving sarcastic comments on her "
            "academic posts in a departmental WhatsApp group. Initially dismissed as 'banter,' "
            "the comments escalated. Within three weeks, Hira stopped participating in class "
            "discussions, withdrew from her study group, and eventually requested a medical leave "
            "citing anxiety and depression.\n\n"
            "**Analysis Questions**\n"
            "1. At what point did the behavior cross from 'banter' to 'cyberbullying'? "
            "What markers distinguish the two?\n"
            "2. Who in this scenario held moral responsibility — only the person who initially "
            "posted, or also those who laughed/reacted?\n"
            "3. What could Hira's classmates have done at each stage to interrupt this cycle?\n"
            "4. How does this case illustrate why 'intent' does not fully determine harm in "
            "cyberbullying scenarios?\n\n"
            "**Key Takeaway**\n"
            "Attitudes that minimize cyberbullying as 'just joking' or 'online drama' enable "
            "escalation. Recognizing the real harm is the first step to prevention."
        ),
        "estimated_minutes": 15,
    },
    {
        "target_construct": "Attitude",
        "title": "Attitude Self-Assessment Quiz",
        "content_type": "quiz",
        "content_body": QUIZ_MAP["Attitude"],
        "estimated_minutes": 10,
    },

    # ── SUBJECTIVE NORM Interventions ──────────────────────────────────────

    {
        "target_construct": "SubjectiveNorm",
        "title": "The Power of Positive Peer Norms",
        "content_type": "reading",
        "content_body": (
            "# The Power of Positive Peer Norms\n\n"
            "## What Are Social Norms?\n"
            "Social norms are the unwritten rules that govern what is considered acceptable "
            "behavior in a group or community. In the Theory of Planned Behavior (Ajzen, 1991), "
            "**Subjective Norms** refer to the perceived social pressure from important others "
            "(friends, family, mentors, community) to perform or not perform a behavior.\n\n"
            "## How Norms Shape Online Behavior\n"
            "Research shows that students in communities where anti-cyberbullying norms are strong:\n"
            "- Are 3x more likely to intervene as bystanders\n"
            "- Are significantly less likely to engage in cyberbullying themselves\n"
            "- Report higher overall well-being and sense of social belonging\n\n"
            "## The Bystander Effect — And How to Overcome It\n"
            "The bystander effect occurs when individuals assume someone else will intervene. "
            "In online spaces, this is amplified because:\n"
            "- Visibility of others' inaction is high\n"
            "- Diffusion of responsibility is easy\n"
            "- Fear of social consequences for speaking up exists\n\n"
            "**The solution**: When even one person breaks the bystander effect, others follow. "
            "You can be that person.\n\n"
            "## Building Positive Norms in Your Community\n"
            "- Publicly support victims (a simple message of solidarity matters)\n"
            "- Challenge harmful behavior when you see it, even subtly\n"
            "- Discuss cyberbullying openly with your friends — normalize the conversation\n"
            "- Use your social platforms to share positive, counter-narrative content\n\n"
            "*Sources: Cialdini & Goldstein (2004); Salmivalli (2010)*"
        ),
        "estimated_minutes": 10,
    },
    {
        "target_construct": "SubjectiveNorm",
        "title": "How Peer Pressure Works — For and Against Cyberbullying",
        "content_type": "video",
        "content_body": (
            "https://www.youtube.com/watch?v=gAb_OcPHabI\n\n"
            "**Watch Time: ~8 minutes**\n\n"
            "This video explores social conformity and peer influence — and how these forces "
            "can either enable cyberbullying or prevent it.\n\n"
            "**Focus points as you watch:**\n"
            "- How does social conformity affect bystander behavior?\n"
            "- What role do 'defenders' play in disrupting bullying dynamics?\n"
            "- How does having even one ally change the social calculation?\n\n"
            "**After watching:** Think about your own social circle. Are the norms in your group "
            "ones that would support a victim or enable silence? What could you do to shift them?"
        ),
        "estimated_minutes": 10,
    },
    {
        "target_construct": "SubjectiveNorm",
        "title": "Case Study: How One Defender Changed the Dynamic",
        "content_type": "case-study",
        "content_body": (
            "# Case Study: How One Defender Changed the Dynamic\n\n"
            "**Scenario**\n"
            "Omar was being mocked in a university Discord server used for class coordination. "
            "Initially, a dozen students remained silent as the comments escalated. "
            "Then Fatima, a respected student in the group, posted: 'This isn't okay. Omar is "
            "a valued member of this class. Let's keep this space respectful.'\n\n"
            "Within minutes, three others added supportive messages. The original bully stopped. "
            "Omar privately messaged Fatima to say that her response had changed everything.\n\n"
            "**Discussion Points**\n"
            "1. What made Fatima's intervention effective? What social factors were at play?\n"
            "2. Why did the other students remain silent until Fatima acted?\n"
            "3. How did Fatima's social status within the group affect the outcome?\n"
            "4. If you had been a silent observer in this group, what would have stopped you "
            "from being the first to act like Fatima?\n\n"
            "**Key Insight**\n"
            "Subjective norms are not fixed — they can be shifted by individual courageous actions. "
            "Being the first to act against cyberbullying is hard but catalytic."
        ),
        "estimated_minutes": 12,
    },
    {
        "target_construct": "SubjectiveNorm",
        "title": "Social Responsibility Reflection Quiz",
        "content_type": "quiz",
        "content_body": QUIZ_MAP["SubjectiveNorm"],
        "estimated_minutes": 8,
    },

    # ── PBC Interventions ──────────────────────────────────────────────────

    {
        "target_construct": "PBC",
        "title": "Practical Skills for Responding to Cyberbullying",
        "content_type": "reading",
        "content_body": (
            "# Practical Skills for Responding to Cyberbullying\n\n"
            "## What Is Perceived Behavioral Control?\n"
            "In the Theory of Planned Behavior, **Perceived Behavioral Control (PBC)** refers to "
            "a person's confidence in their ability to perform a behavior. Higher PBC = more likely "
            "to act. This module builds your actual skills to increase genuine PBC.\n\n"
            "## Skill 1: Recognizing What You Can Control\n"
            "You cannot control a bully's actions. You CAN control:\n"
            "- Whether you reach out to a victim privately\n"
            "- Whether you report through official channels\n"
            "- Whether you refuse to participate or laugh along\n"
            "- Whether you document evidence\n\n"
            "## Skill 2: How to Report on Major Platforms\n"
            "**WhatsApp:** Long-press message → Report → Select reason\n"
            "**Instagram:** Tap three dots → Report → Select 'Bullying or Harassment'\n"
            "**Facebook:** Click three dots on post → Find Support → Bullying\n"
            "**Discord:** Right-click message → Report Message\n\n"
            "## Skill 3: Supporting a Victim\n"
            "1. Reach out privately — don't put them on the spot publicly\n"
            "2. Validate their feelings: 'What happened to you is wrong.'\n"
            "3. Ask what support they want — don't assume\n"
            "4. Share resources: university counseling, cyberbullying helplines\n"
            "5. Follow up — one message isn't enough\n\n"
            "## Skill 4: Protecting Your Own Digital Wellbeing\n"
            "- Review your privacy settings on all platforms monthly\n"
            "- Use two-factor authentication\n"
            "- Know how to block/restrict accounts effectively\n"
            "- Screenshot and preserve evidence before blocking\n\n"
            "*Sources: Kowalski et al. (2014); Dehue et al. (2012)*"
        ),
        "estimated_minutes": 15,
    },
    {
        "target_construct": "PBC",
        "title": "How to Be an Upstander Online",
        "content_type": "video",
        "content_body": (
            "https://www.youtube.com/watch?v=jLn-lgxDl7E\n\n"
            "**Watch Time: ~9 minutes**\n\n"
            "This video provides practical strategies for becoming an 'upstander' — someone who "
            "actively responds to cyberbullying rather than remaining a passive bystander.\n\n"
            "**As you watch, note:**\n"
            "- The specific language and strategies the upstanders use\n"
            "- How they manage the risk of backlash\n"
            "- What skills they demonstrate that you could practice\n\n"
            "**Exercise after watching:**\n"
            "Write down three specific sentences you could actually say or type if you witnessed "
            "cyberbullying in an online group you belong to."
        ),
        "estimated_minutes": 11,
    },
    {
        "target_construct": "PBC",
        "title": "Case Study: From Bystander to Upstander",
        "content_type": "case-study",
        "content_body": (
            "# Case Study: From Bystander to Upstander\n\n"
            "**Scenario**\n"
            "Imran had low confidence in his ability to intervene when he saw cyberbullying. "
            "He told himself: 'I don't know what to say,' 'It's not my business,' and "
            "'What if they turn on me?'\n\n"
            "After learning practical skills, Imran encountered a situation where a classmate "
            "was being targeted with rumors on a class Facebook group. Instead of scrolling past, "
            "he did three things:\n"
            "1. Privately messaged the victim: 'I saw what's happening and I want you to know I "
            "don't believe any of it. How are you doing?'\n"
            "2. Reported the posts using the platform's built-in tools.\n"
            "3. Posted publicly: 'Spreading unverified rumors about classmates isn't something I "
            "want to see in this group.'\n\n"
            "The victim later told Imran that his private message had been the most meaningful "
            "support they received.\n\n"
            "**Reflection Questions**\n"
            "1. Which of Imran's three actions do you feel most capable of taking right now?\n"
            "2. Which feels most difficult, and why?\n"
            "3. What specific barrier — knowledge, confidence, fear — has been your biggest "
            "obstacle to acting like Imran in the past?\n"
            "4. What is one small step you could take this week to practice being an upstander?"
        ),
        "estimated_minutes": 13,
    },
    {
        "target_construct": "PBC",
        "title": "Building Your Action Plan — PBC Skills Quiz",
        "content_type": "quiz",
        "content_body": QUIZ_MAP["PBC"],
        "estimated_minutes": 10,
    },
]


# ═══════════════════════════════════════════════════════════════════════════════
# DEMO USER
# ═══════════════════════════════════════════════════════════════════════════════

DEMO_USER = {
    "full_name": "Demo Student",
    "email": "demo@riphah.edu.pk",
    "cms_number": "DEMO-001",
    "password": "Demo1234!",
}


# ═══════════════════════════════════════════════════════════════════════════════
# SEED FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

def seed_scenarios():
    if db.query(models.Scenario).count() > 0:
        print("[i] Scenarios already seeded -- skipping.")
        return

    count = 0
    for item in SCENARIOS:
        scenario = models.Scenario(
            construct=item["construct"],
            stage=item["stage"],
            scenario_text=item["scenario_text"],
            question_text=item["question_text"],
        )
        db.add(scenario)
        db.flush()

        for text, score in item["options"]:
            db.add(models.ScenarioOption(
                scenario_id=scenario.id,
                option_text=text,
                score=score,
            ))
        count += 1

    db.commit()
    print(f"[+] Seeded {count} scenarios with options.")


def seed_interventions():
    if db.query(models.Intervention).count() > 0:
        print("[i] Interventions already seeded -- skipping.")
        return

    for item in INTERVENTIONS:
        db.add(models.Intervention(
            target_construct=item["target_construct"],
            title=item["title"],
            content_type=item["content_type"],
            content_body=item["content_body"],
            estimated_minutes=item["estimated_minutes"],
        ))

    db.commit()
    print(f"[+] Seeded {len(INTERVENTIONS)} interventions.")


def seed_demo_user():
    from auth.utils import hash_password

    existing = db.query(models.User).filter(models.User.email == DEMO_USER["email"]).first()
    if existing:
        print("[i] Demo user already exists -- skipping.")
        return

    db.add(models.User(
        full_name=DEMO_USER["full_name"],
        email=DEMO_USER["email"],
        cms_number=DEMO_USER["cms_number"],
        password_hash=hash_password(DEMO_USER["password"]),
        role="student",
    ))
    db.commit()
    print(f"[+] Demo user created: {DEMO_USER['email']} / {DEMO_USER['password']}")


if __name__ == "__main__":
    print("\n[+] Seeding TPB Cyberbullying Intervention System database...\n")
    seed_scenarios()
    seed_interventions()
    seed_demo_user()
    print("\n[+] Seeding complete! Run: uvicorn main:app --reload\n")
    db.close()
