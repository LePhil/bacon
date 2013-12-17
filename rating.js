module.exports = function Rating() {
    this.value = 0;
    var upVoters = [];
    var downVoters = [];
    var self = this;
    
    this._up = function( userId ) {
        if ( !upVoters[userId] ) {
            // not upvoted yet --> upvote
            self.value++;
            upVoters[userId] = true;

            // .. and check if already downvoted
            if ( downVoters[userId] ) {
                // if yes, take the downvote away!
                self.value++;
                downVoters[userId] = false;
            }
        } else {
            // already upvoted --> take upvote away
            self.value--;
            upVoters[userId] = false;
        }

        console.log("now has", self.value);
        return self.value;
    };
    
    this._down = function ( userId ) {
        if ( !downVoters[userId] ) {
            // not downvoted yet --> downvote
            self.value--;
            downVoters[userId] = true;

            // .. and check if already upvoted
            if ( upVoters[userId] ) {
                // if yes, take the upvote away!
                self.value--;
                upVoters[userId] = false;
            }
        } else {
            // already downvoted --> take downvote away
            self.value++;
            downVoters[userId] = false;
        }

        console.log("now has", self.value);
        return self.value;

    };
};



