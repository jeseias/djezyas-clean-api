// Test script for login mutation
const testLogin = async () => {
	const loginQuery = `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        user {
          id
          name
          email
          username
        }
        session {
          id
          userId
        }
        tokens {
          accessToken
          refreshToken
        }
        message
      }
    }
  `;

	const variables = {
		input: {
			email: "test@example.com",
			password: "password123",
			deviceInfo: {
				userAgent:
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
				deviceType: "DESKTOP",
				browser: "Chrome",
				os: "macOS",
			},
		},
	};

	try {
		console.log("Testing login mutation...");
		const response = await fetch("https://api.djezyas.com/graphql", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Origin: "https://www.djezyas.com",
			},
			body: JSON.stringify({
				query: loginQuery,
				variables: variables,
			}),
		});

		console.log("Response status:", response.status);
		console.log(
			"Response headers:",
			Object.fromEntries(response.headers.entries()),
		);

		const data = await response.text();
		console.log("Response body:", data);

		if (response.ok) {
			const jsonData = JSON.parse(data);
			console.log("Parsed response:", jsonData);
		}
	} catch (error) {
		console.error("Error testing login:", error);
	}
};

// Run the test
testLogin();
