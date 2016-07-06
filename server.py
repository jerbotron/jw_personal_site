from flask import Flask, request, render_template
import urllib2, json
app = Flask(__name__)

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html');

@app.route('/education')
def education():
    return render_template('education.html');

@app.route('/experience')
def experience():
    return render_template('experience.html');

@app.route('/portfolio')
def portfolio():
    return render_template('portfolio.html');

@app.route('/2048game')
def game2048():
    return render_template('2048game.html');

@app.route('/test')
def test():
    return render_template('test.html');

if __name__ == "__main__":
    app.run()