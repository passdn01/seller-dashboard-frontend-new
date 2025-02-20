
const roleRoutes = {
    superAdmin: [
        "/home/dashboard",
        "/home/mapData",
        "/home/rideJourney",
        "/drivers/allDrivers",
        "/drivers/liveDrivers",
        "/drivers/allDrivers",
        "/drivers/allVerified",
        "/rides/allRides",
        "/issueAssigner",
        "/issueSolver",
        "/issueDetail",
        "/users",
        "/admin",
        "/pricing"
    ],
    admin: [
        "/home/dashboard",
        "/home/mapData",
        "/home/rideJourney",
        "/drivers/allDrivers",
        "/drivers/liveDrivers",
        "/drivers/allDrivers",
        "/drivers/allVerified",
        "/rides/allRides",
        "/issueAssigner",
        "/issueSolver",
        "/issueDetail",
        "/users",
    ],
    verifier: ["/home/dashboard", "/home/mapData", "/home/rideJourney", "/drivers/allDrivers",
        "/drivers/liveDrivers",
        "/drivers/allDrivers",
        "/drivers/allVerified",],
    userExplore: ["/home/dashboard", "/users"],
    verifierAndIssueAssigner: [
        "/home/dashboard",
        "/drivers/allDrivers",
        "/drivers/liveDrivers",
        "/drivers/allDrivers",
        "/drivers/allVerified",
        "/issueAssigner",
        "/issueSolver",
        "/issueDetail",
        "/users"
    ],
    issueAssigner: ["/home/dashboard", "/issueAssigner", "/issueDetail", "/issueSolver"],
    issueSolver: ["/home/dashboard", "/issueSolver", "/issueDetail"],
    guest: ["/home/dashboard"],
};

export default roleRoutes;