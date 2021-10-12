const debug_log = false;

module.exports = {
    log: function(msg, level){
        if(level == "DEBUG" && debug_log == true){
            console.log("DEBUG - " + msg)
        }else if(level == "INFO"){
            console.log("INFO - " + msg);
        }
    }
}