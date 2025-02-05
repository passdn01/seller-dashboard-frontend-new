
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
        "/issueAssigner", 
        "/issueSolver", 
        "/issueDetail", 
        "/blogs",
        "/users",
    ],
    admin: [
        "/home/dashboard",
        "/drivers/allDrivers",
        "/rides/allRides",
        "/agents/allAgents",
        "/issueAssigner", 
        "/issueSolver", 
        "/issueDetail", 
    ],
    verifier: ["/home/dashboard", "/drivers/allDrivers"],
    userExplore: ["/home/dashboard", "/drivers/allDrivers"],
    verifierAndIssueAssigner: [
        "/home/dashboard",
        "/drivers/allDrivers",
        "/issueAssigner", 
        "/issueSolver",
        "/issueDetail", 
        "/agents/allAgents",
    ],
    issueAssigner: ["/home/dashboard", "/issueAssigner", "/issueDetail", ],
    issueSolver: ["/home/dashboard", "/issueSolver", "/issueDetail", ],
    guest: ["/home/dashboard"],
};

export default roleRoutes;