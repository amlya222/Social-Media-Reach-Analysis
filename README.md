# Social Media Reach Analysis

A lightweight analytics dashboard built with Flask and vanilla HTML/CSS/JavaScript to visualize social media performance from a local CSV dataset.
<img width="1899" height="866" alt="image" src="https://github.com/user-attachments/assets/f0212967-9934-42fd-a365-8fba769aca28" />
<img width="1882" height="865" alt="image" src="https://github.com/user-attachments/assets/69af4d67-940f-47df-a648-c98b141450eb" />
<img width="1885" height="858" alt="image" src="https://github.com/user-attachments/assets/8b5ad208-a971-4772-b484-e83748820e94" />
<img width="1896" height="833" alt="image" src="https://github.com/user-attachments/assets/bacc0a47-e023-48ec-8b7a-1f2469ba2aae" />
<img width="1902" height="828" alt="image" src="https://github.com/user-attachments/assets/0f87fab8-e772-41fe-ad1c-6206135deec3" />
<img width="1900" height="828" alt="image" src="https://github.com/user-attachments/assets/9f9fa5d3-c561-46a4-964a-9c8b0b8d192b" />

## Features

- Flask backend serving a data API from `social_media_performance.csv`
- Dashboard UI with:
  - total reach, likes, comments, shares, engagement and sentiment
  - filtered views by platform and post type
  - line chart for reach over time
  - channel distribution and content breakdown charts
  - engagement and reach insights pages
- Responsive sidebar navigation across the dashboard pages

## Project Files

- `app.py` — Flask application serving frontend and API data
- `index.html` — dashboard frontend layout and page sections
- `styles.css` — dashboard visual styling
- `script.js` — frontend logic, data loading, chart rendering
- `requirements.txt` — Python dependencies
- `social_media_performance.csv` — source dataset used by the app

## Requirements

- Python 3.8+
- `Flask` (installed via `requirements.txt`)

## Setup

1. Open a terminal in the project directory.
2. Create and activate a virtual environment (recommended):

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

3. Install dependencies:

```powershell
pip install -r requirements.txt
```

## Run the app

```powershell
python app.py
```

Then open the browser at `http://127.0.0.1:5000`.

## Notes

- The dashboard loads dataset records from `social_media_performance.csv` using the Flask API endpoint at `/api/data`.
- If the CSV changes, restart the Flask server to reload the latest data.
