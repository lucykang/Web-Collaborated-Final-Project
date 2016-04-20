/* Custom Error
 Hae Yeon (Lucy) Kang and Cindy Diaz
 Manage Support Website
 This file contains our custom error object
*/
module objects {
    export class CustomError extends Error {
        public status: number;
        constructor(message?: string) {
            super(message);
        }
    }
}

export = objects;    
