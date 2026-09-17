TPB-Based AI Cyberbullying Intervention System

A full-stack web application that helps prevent cyberbullying through *personalized behavioral interventions* based on the *Theory of Planned Behavior (TPB). The system assesses users' behavioral intentions, identifies potential cyberbullying risk factors, and delivers personalized interventions using a **hybrid AI approach. Unlike traditional cyberbullying systems that focus on detection or reporting after incidents occur, this system emphasizes **prevention* by promoting positive online behavior through tailored guidance.

---

 Features

- User Registration and Secure Authentication
- TPB-Based Behavioral Assessment
- Personalized Intervention Generation
- AI-Assisted Intervention Personalization
- Interactive User Dashboard
- Assessment History
- Progress Tracking
- Responsive Web Interface

---

Technology Stack

Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3

 Backend
- FastAPI
- Python
- SQLAlchemy
- Pydantic

Database
- SQLite

 AI Integration
- OpenAI API

---

System Workflow

1. Users register and log in to the system.
2. Users complete the TPB assessment questionnaire.
3. The system evaluates three TPB constructs:
   - Attitude
   - Subjective Norm
   - Perceived Behavioral Control
4. Assessment responses are analyzed to determine the user's behavioral profile.
5. The system selects the most appropriate intervention based on the assessment results.
6. AI personalizes the intervention to make it more engaging and relevant while preserving its intended behavioral objective.
7. Users receive personalized recommendations and can monitor their progress through the dashboard.

---

11                                                                                                                                                                                                            Project Structure


TPB-Based-AI-Cyberbullying-Intervention-System/
│
├── client/                  # React Frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── server/                  # FastAPI Backend
│   ├── auth/
│   ├── assessment/
│   ├── dashboard/
│   ├── interventions/
│   ├── docs/
│   ├── database.py
│   ├── models.py
│   ├── main.py
│   └── requirements.txt
│
└── README.md


---

Installation

### Clone the Repository

bash
git clone https://github.com/your-username/TPB-Based-AI-Cyberbullying-Intervention-System.git

cd TPB-Based-AI-Cyberbullying-Intervention-System


### Backend Setup

bash
cd server

python -m venv .venv


Activate the virtual environment.

Windows

bash
.venv\Scripts\activate


Linux/macOS

bash
source .venv/bin/activate


Install dependencies.

bash
pip install -r requirements.txt


Run the backend server.

bash
uvicorn main:app --reload


---

 Frontend Setup

bash
cd client

npm install

npm run dev


---

Running the Application

Frontend


http://localhost:5173


Backend


http://localhost:8000


FastAPI Documentation


http://localhost:8000/docs


---

Objectives

- Prevent cyberbullying through early behavioral intervention.
- Assess behavioral intentions using the Theory of Planned Behavior.
- Provide personalized interventions based on assessment outcomes.
- Encourage responsible digital citizenship.
- Monitor behavioral progress over time.

---

Future Enhancements

- Parent Dashboard
- Teacher Dashboard
- Mobile Application
- Multi-language Support
- Advanced Analytics
- PostgreSQL Integration
- Learning Management System (LMS) Integration

---

Authors

Final Year Project

Department of Computer Science

---

License

This project was developed for academic and research purposes as part of a Final Year Project.
