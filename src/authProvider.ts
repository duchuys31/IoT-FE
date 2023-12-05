import { AuthBindings } from "@refinedev/core";

export const TOKEN_KEY = "refine-auth";

export const authProvider: AuthBindings = {
  register: async ({ username, email, password }) => {
    if ((username || email) && password) {
      console.log("passsssssss")
      const response = await fetch("http://localhost:8000/api/account/register/", 
        {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "email": email,
            "password": password
          })
        }
      )
      const status = await response.status
      if (status === 400){
        return {
          success: false, 
          error: {
            name: "RegisterError",
            message: "Registration error, please try again!",
          },
        }
      }
      return {
        success: true,
        redirectTo: "/login",
      };
    }

    return {
      success: false,
      error: {
        name: "RegisterError",
        message: "Registration error, please try again!",
      },
    };
  },
  login: async ({ username, email, password }) => {
    if ((username || email) && password) {
      const response = await fetch("http://localhost:8000/api/account/login/", 
        {
          // "http://localhost:8000/api/account/login/"
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "email": email,
            "password": password
          })
        }
      )
      const data = await response.json()
      const status = await response.status
      console.log(data)
      if (status === 400){
        return {
          success: false, 
          error: {
            name: "LoginError",
            message: "Invalid username or password",
          },
        }
      }
      localStorage.setItem(TOKEN_KEY, data.access);
      return {
        success: true,
        redirectTo: "/",
      };
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid username or password",
      },
    };
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return {
        id: 1,
        name: "Ngo Khanh",
        avatar: "https://i.pravatar.cc/300",
      };
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
