const moment = require('moment');
const snippets = require("smart-text-snippet");
const currencyFormatter = require("currency-formatter");


module.exports = {

    select: function(selected, options){
        return options.fn(this).replace(new RegExp(' value=\"'+ selected + '\"'), '$&selected="selected"');
    },


    generateDate: function(date, format){
        return moment(date).format(format);
    },


    smartText: function(text){
       return snippets.snip(text, {len: 150});
    },

    detectAdminHome: function(role, options ){

        let output = ""

        if(role == "admin"){

             output += `<a href="/admin">Admin</a>`;

           return options.fn() + output;

        }



    },





    detectAdmin: function(role, options ){

        let output = ""

        if(role == "admin"){

             output += `<li class="nav-item">
             <a href="/admin/manage" class="nav-link">
               <i class="nav-icon fas fa-user-tie"></i>
               <p>
                 Manage
    
               </p>
             </a>
           </li>

           <li class="nav-item">
             <a href="/admin/withdrawal_request" class="nav-link">
               <i class="nav-icon fas fa-user-tie"></i>
               <p>
                 Withdrawal Requests
    
               </p>
             </a>
           </li>

           
           <li class="nav-item">
             <a href="/admin/withdrawal_request" class="nav-link">
               <i class="nav-icon fas fa-user-tie"></i>
               <p>
                 View Subcriber's Packages
               </p>
             </a>
           </li>
           
           
           
           `;

           return options.fn() + output;

        }



    },












    currencyFormat: function(val){

        return currencyFormatter.format(val, { code : "USD"});

    },



    paginate: function(options){



        console.log(options.hash.current)
        let output = '';
        if(options.hash.current === 1){
            output += `<li class="page-item disabled"><a class="page-link">First</a></li>`;
            // output += `
            //     <li class="page-item">
            //         <a href="#" class="page-link" aria-label="Previous">
            //             <i class="ti-angle-left"></i>
            //         </a>
            //     </li>`;

        } else {
            output += `<li class="page-item"><a href="?page=1" class="page-link">First</a></li>`;
        }


        let i = (Number(options.hash.current) > 5 ? Number(options.hash.current) - 4 : 1);

        if(i !== 1){
            output += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
        }

        for(; i <= (Number(options.hash.current) + 4) && i <= options.hash.pages; i++){
            if(i === options.hash.current){
                output += `<li class="page-item active"><a class="page-link">${i}</a></li>`;

            }
            
            else {
                output += `<li class="page-item "><a href="?page=${i}" class="page-link">${i}</a></li>`;
            }


            if(i === Number(options.hash.current) + 4 && i < options.hash.pages){
                output += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
            }



        }


         if(options.hash.current === options.hash.pages) {


             output += `<li class="page-item disabled"><a class="page-link">Last</a></li>`;


         } else {


             output += `<li class="page-item "><a href="?page=${options.hash.pages}" class="page-link">Last</a></li>`;


         }


        return output;



    }



};
