COPY ecommercelogs (time, session, action, product, category, campaign)
FROM 's3://aws-heroku-integration-demo/fixture.csv'
ACCESS_KEY_ID $1
SECRET_ACCESS_KEY $2
CSV
IGNOREHEADER 1
TIMEFORMAT 'auto';
