/*********************************************************************************
 * WEB422 – Assignment 3
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Artem Kulihina Student ID: 128516168 Date: 2019-02-13
 *
 *
 ********************************************************************************/

const api = "https://protected-oasis-33486.herokuapp.com";
var viewModel = {
    teams: ko.observable([]),
    employees: ko.observable([]),
    projects: ko.observable([])
};


$(function () {
    console.log(`%c Loading, please wait...`, 'color: #42aaf4');
    initializeTeams()
        .then(initializeEmployees)
        .then(initializeProjects)
        .then(function () {

            ko.applyBindings(viewModel);

            $("select.multiple").multipleSelect({
                filter: true
            });
            $("select.single").multipleSelect({
                single: true,
                filter: true
            });

            removeLoader();
            console.log(`%c Loading Completed!`, 'color: #42aaf4');
        })
        .catch(err => {
            console.error("Error! Please check if the API is up!");
            showGenericModal("Error", err);
        })
});


async function initializeTeams() {
    const teams = await requestData("teams-raw");
    viewModel.teams = ko.mapping.fromJS(await sort(teams));
}

async function initializeEmployees() {
    const employees = await requestData("employees");
    viewModel.employees = ko.mapping.fromJS(employees);
}

async function initializeProjects() {
    const projects = await requestData("projects");
    viewModel.projects = ko.mapping.fromJS(projects);
}

async function saveTeam() {
    const currentTeam = this;

    const data = JSON.stringify({
        Projects: currentTeam.Projects(),
        Employees: currentTeam.Employees(),
        TeamLead: currentTeam.TeamLead()
    });

    const result = await saveData(`team/${currentTeam._id()}`, data);

    console.log(result);
    if (result) {
        showGenericModal("Success", currentTeam.TeamName() + " Updated Successfully");
    } else {
        showGenericModal(result, `Error updating ${currentTeam.TeamName()} information`);
    }
}


//helpers:

function requestData(path) {
    return new Promise((resolve, reject) => {
        $.get(`${api}/${path}`)
            .done(function (data) {
                resolve(data);
            })
            .fail(function (e) {
                reject();
                showGenericModal(e.statusText, `Unable to get ${upperCaseFirstLetter(path)}`);
            });
    });
}

function saveData(path, data) {
    return new Promise((resolve, reject) => {
        $.ajax({
                url: `${api}/${path}`,
                type: "PUT",
                contentType: "application/json",
                data: data
            })
            .done(function () {
                resolve(true);
            })
            .fail(function (e) {
                reject(e);
            });
    });
}

function removeLoader() {
    const loaderElem = document.getElementById("loaderID");
    loaderElem.parentNode.removeChild(loaderElem);
}

function upperCaseFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showGenericModal(title, message) {
    $(".modal-title").html(title);
    $(".modal-body").html(message);
    $("#genericModal").modal({});
}


function sort(arr) {
    return _.sortBy(arr, function (team) {
        return parseInt(team.TeamName.slice(-2), 10);
    });
}