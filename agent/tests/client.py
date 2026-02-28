import requests
import json
import sys


def chat_with_agent():
    url = "http://localhost:5002/v1/chat/stream"

    # The payload matching your new schema
    payload = {
        "thread_id": "session-user-02",
        "order_id": "84bf516d-0768-4961-84f6-c4a25828f44f",
        "messages": [{"role": "user", "content": "hello"}],
    }

    print(f"User: {payload['messages'][0]['content']}")
    print("Agent: ", end="", flush=True)

    # stream=True tells Python to hold the HTTP connection open
    with requests.post(url, json=payload, stream=True) as response:

        # Iterate over the SSE stream line by line
        for line in response.iter_lines():
            if line:
                decoded_line = line.decode("utf-8")

                # Check for our strict SSE format
                if decoded_line.startswith("data: "):

                    # Strip away the "data: " prefix to get the raw string
                    data_str = decoded_line[6:]

                    # Check for the kill switch
                    if data_str == "[DONE]":
                        break

                    try:
                        # Parse the OpenAI-formatted chunk
                        data_json = json.loads(data_str)

                        # Dig into the JSON to grab the token
                        token = data_json["choices"][0]["delta"].get("content", "")

                        # Print the token to the terminal immediately
                        sys.stdout.write(token)
                        sys.stdout.flush()

                    except json.JSONDecodeError:
                        # Ignore malformed chunks
                        pass

    print("\n\n[Stream Finished]")


if __name__ == "__main__":
    chat_with_agent()
