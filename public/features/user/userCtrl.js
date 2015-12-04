angular.module('groupScoop').controller('userCtrl', function ($scope, authService, userService, socketService) {

    var socket = io.connect();

    // GET AUTHENTICATED USER AND THEIR GROUPS ON PAGE LOAD //
    $scope.getAuthUser = function () {
        authService.getUser().then(function (user) {
            console.log('MY DATA: ', user);
            $scope.user = user;
            $scope.myGroups = user.groups;
            $scope.myInvitations = user.invitations;
        }).catch(function(error){
            console.log('ERROR!!!', error);
        })
    };
    $scope.getAuthUser();


    // CREATE NEW GROUP //
    $scope.newGrp = false;
    $scope.createGroupButtons = function () {
        $scope.newGrp = !$scope.newGrp;
    }

    $scope.createNewGroup = function () {
        var grp = {
            groupName: $scope.grpName,
            createdOn: moment().format('ddd MMM DD YYYY, h:mm a'),
            users: [$scope.user._id]
        };

        userService.createGroup(grp).then(function (response) {
            console.log('SUCCESS, GROUP CREATED: ', response);
            $scope.grpName = '';
            $scope.newGrp = !$scope.newGrp;
            $scope.myGroups.push(response);
        })
        // socketService.emit('createNewGroup', grp);
    };

    // socketService.on('getGroups', function (data) {
    //     $scope.myGroups.push(data);
    //     $scope.$digest();
    // });
    
    
    // INVITE USER TO GROUP //
    // OPEN SEARCH FIELD //
    $scope.getUsers = function (idx, grpId) {
        idx.searchForUser = !idx.searchForUser;
        $scope.groupId = grpId;
        // GET USERS IN DB //
        userService.searchUsers().then(function (response) {
            $scope.users = response;
        })
    };
    
    // QUERY USERS //
    $scope.findUser = function (queryText) {
        var query = angular.lowercase(queryText);
        return $scope.users.filter(function (user) {
            return user.name.toLowerCase().indexOf(query) !== -1;
        });
    };

    // POST INVITE TO THE INVITED USER OBJ //
    $scope.sendInvite = function (targetUserId) {
        var invitation = {
            targetUserId: targetUserId,
            senderName: $scope.user.google.name,
            invitedTo: $scope.groupId
        };
        userService.sendInvite(invitation).then(function (response) {
            console.log(response);
        });
    };
    
    // GET INVITATIONS //
    $scope.getInvites = function () {
        userService.getInvitations($scope.user._id).then(function (response) {
            console.log('MY INVITATIONS: ', response);
            $scope.myInvites = response;
        });
    };
    
    // ACCEPT INVITATIONS //
    $scope.acceptInvite = function(invite){
        var acceptedInviteData = {
            inviteData: invite,
            acceptedBy: $scope.user._id
        };        
        userService.acceptInvitation(acceptedInviteData).then(function(response){
            console.log('after user accepts invite ', response);
            $scope.updateGroupList();
            $scope.getInvites();
        });
    };
    
    $scope.updateGroupList = function(){
        userService.getGroups().then(function(response){
            console.log('this is newly added group: ', response);
            $scope.myGroups.push(response);
        });
    };
    
    
    
   























    
    // SOCKET TESTS //

    $scope.messages = [];

    $scope.send = function () {
        socketService.emit('sendMsg', $scope.msg);
    };

    socketService.on('getMsg', function (data) {
        $scope.messages.push(data);
        $scope.$digest();
    });











});