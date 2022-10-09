import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    ...
    result = None
    action = event.get('keyword')
    print(event.get('keyword'))
 
    logger.info('Action is  %s', action)
   

    response = {'result':"Atul Jha says " + action }
    return response