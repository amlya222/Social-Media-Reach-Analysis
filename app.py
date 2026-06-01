from csv import DictReader
from flask import Flask, jsonify, send_from_directory

app = Flask(__name__, static_folder='.', static_url_path='')

DATA_FILE = 'social_media_performance.csv'

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/data')
def api_data():
    posts = []
    with open(DATA_FILE, mode='r', encoding='utf-8', newline='') as csvfile:
        reader = DictReader(csvfile)
        for row in reader:
            posts.append({
                'post_id': int(row['post_id']),
                'platform': row['platform'],
                'content_type': row['content_type'],
                'topic': row['topic'],
                'language': row['language'],
                'region': row['region'],
                'post_datetime': row['post_datetime'],
                'hashtags': row['hashtags'],
                'sentiment_score': float(row['sentiment_score']) if row['sentiment_score'] else None,
                'views': int(row['views']),
                'likes': int(row['likes']),
                'comments': int(row['comments']),
                'shares': int(row['shares']),
                'engagement_rate': float(row['engagement_rate']) if row['engagement_rate'] else None,
                'is_viral': int(row['is_viral']) if row['is_viral'] else 0,
            })
    return jsonify(posts)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
