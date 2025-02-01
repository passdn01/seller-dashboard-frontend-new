
const roleRoutes = {
    superAdmin: [
        "/home/dashboard",
        "/home/mapData",
        "/drivers/allDrivers",
        "/drivers/liveDrivers",
        "/drivers/allDrivers",
        "/drivers/allVerified",
        "/rides/allRides",
        "/agents/allAgents",
        "/issues",
        "/blogs",
        "/users",
    ],
    admin: [
        "/home/dashboard",
        "/drivers/allDrivers",
        "/rides/allRides",
        "/agents/allAgents",
        "/issues",
    ],
    verifier: ["/home/dashboard", "/drivers/allDrivers"],
    userExplore: ["/home/dashboard", "/drivers/allDrivers"],
    verifierAndIssueAssigner: [
        "/home/dashboard",
        "/drivers/allDrivers",
        "/issues",
        "/agents/allAgents",
    ],
    issueAssigner: ["/home/dashboard", "/issues"],
    guest: ["/home/dashboard"],
};

export default roleRoutes;