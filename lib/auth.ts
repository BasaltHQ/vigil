import { createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { client } from "./thirdweb";
import { sha256 } from "thirdweb/utils";

// Make sure to load this only on the server
const secretHex = (process.env.THIRDWEB_SECRET_KEY ? sha256(process.env.THIRDWEB_SECRET_KEY as `0x${string}`) : "0x0000000000000000000000000000000000000000000000000000000000000000") as any as `0x${string}`;

const adminAccount = privateKeyToAccount({ 
  client, 
  privateKey: secretHex
});

export const thirdwebAuth = createAuth({
  domain: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || "localhost:3000",
  adminAccount,
  client,
  login: {
    statement: "Log in to Basalt Vigil",
    uri: "http://localhost:3000",
    resources: ["http://localhost:3000"],
    version: "1",
  }
});
