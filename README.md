# News_Monitoring

News Monitoring app which feeds RSS

[![Built with Cookiecutter Django](https://img.shields.io/badge/built%20with-Cookiecutter%20Django-ff69b4.svg?logo=cookiecutter)](https://github.com/cookiecutter/cookiecutter-django/)
[![Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)

# 📰 NewsMonitor

**NewsMonitor** is a Django-based web application designed to help users monitor and manage news sources and stories tagged to companies. The platform supports user authentication, source and story management, and role-based access control for staff and regular users. ### It is fully optimized and uses single SQL Query for all every function (add story,update story,add source,update source).

---

## 🚀 Features

- 🔐 **Authentication**: User login, logout, and role-based redirection.
- 🏢 **Company Management**: Every user is associated with a company.
- 📡 **Source Management**:
  - Add, edit, delete sources.
  - Each source includes name, URL, and tagged companies.
  - Staff users can view all sources; regular users see only theirs.
- 📚 **Story Management**:
  - Add, edit, delete stories.
  - Stories include title, URL, body, published date, and tagged companies.
  - Staff users can view all stories; regular users see company-relevant ones.
- 🔍 **Search & Filter**: Keyword search across sources and stories.
- 🔄 **AJAX Pagination**: Seamless pagination and filtering using AJAX.
- 📊 **Optimized DB Access**: Uses `select_related`, `prefetch_related`, and `annotate` to reduce queries.

---

## 🧱 Tech Stack

- **Backend**: Django
- **Frontend**: HTML, TailwindCSS, JavaScript (with AJAX)
- **Database**: PostgreSQL (recommended)
- **Forms**: Django Forms + Tom Select for multi-select UI
- **Auth**: Django's built-in authentication system

---

## 🔧 Setup Instructions

1. Clone the Repository
bash
git clone https://github.com/your-username/newsmonitor.git
cd newsmonitor
2. Create a Virtual Environment

python3 -m venv env
source env/bin/activate

3. Install Dependencies

pip install -r requirements.txt

4. Configure Database

Update settings.py to connect to your PostgreSQL database or use SQLite for development.

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'USER': 'your_db_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

 ### Project Structure

  ### newsmonitor/
  ├── company/           # Company-related views and models
  ├── source/            # Source CRUD logic
  ├── story/             # Story management
  ├── templates/         # HTML templates
  ├── static/            # Static files (CSS, JS)
  ├── newsmonitor/       # Django settings and URLs
  └── manage.py




