from eralchemy import render_er

## Draw from database
render_er('sqlite:///database.db', 'erd_from_sqlite.png')