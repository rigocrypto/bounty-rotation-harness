import { getBillingAccount, getEntitlements, getManagedAccessDecision } from "./billingService";

function parseClientId(argv: string[]): string {
  const idx = argv.indexOf("--client");
  if (idx === -1 || !argv[idx + 1]) {
    throw new Error("Usage: npm run billing:status -- --client <clientId>");
  }

  return argv[idx + 1];
}

function main(): void {
  const clientId = parseClientId(process.argv.slice(2));
  const account = getBillingAccount(clientId);
  const decision = getManagedAccessDecision(clientId);
  const entitlements = getEntitlements(clientId);

  console.log(
    JSON.stringify(
      {
        clientId,
        account,
        accessDecision: decision,
        entitlements
      },
      null,
      2
    )
  );
}

main();
