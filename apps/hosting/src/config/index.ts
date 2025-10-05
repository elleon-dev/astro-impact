import { includes } from "lodash";
import { config } from "@/config/config.ts";

const hostName = window.location.hostname;

const hostsProduction: string[] = ["astro-impact.vercel.app"];

const currentEnvironment = includes(hostsProduction, hostName)
  ? "production"
  : "development";

console.log(currentEnvironment);

const currentConfig = config[currentEnvironment];

export { currentEnvironment, currentConfig };
