COPY ecommercelogs (time, session, action, product, category, campaign)
FROM $1
ACCESS_KEY_ID $2
SECRET_ACCESS_KEY $3
CSV
IGNOREHEADER 1
TIMEFORMAT 'auto';
