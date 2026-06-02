from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

OLLAMA_HOST = os.getenv('OLLAMA_HOST')

# OLLAMA_HOST = ''

client = OpenAI(
    base_url = f"http://{OLLAMA_HOST}:11434/v1",
    api_key='ollama', # required, but unused
)

response = client.chat.completions.create(
  model="gemma2:2B",
  messages=[
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Who won the world series in 2020?"},
    {"role": "assistant", "content": "The LA Dodgers won in 2020."},
    {"role": "user", "content": "Where was it played?"}
  ]
)
print(response.choices[0].message.content)