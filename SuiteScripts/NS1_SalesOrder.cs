using System;

namespace ConsoleApp4
{
     /* exmaple NS1 
        *NS1_SalesOrder.cs
        *
        * pj92singh 
        * Prabhjit Singh 
        * 
        * using class for NS related record creation 
        * can work with webservices request with either using the POSTman test
        * or the Suiteanswers connector test
        */
        public class SalesOrder
        {
            //either intalize or use nullable refernce types
            public string? Entity { get; set; }
            public int? Subsidiary { get; set; }
            public string? Email { get; set; }
            public int? Location { get; set; }

        }
        class Program
        {
            static void Main(string[] args)
            {
                Console.ReadKey();
            }
            //async 
            //wait 2 seconds and respond with the list
            async static IAsyncEnumerable<SalesOrder> GetSalesOrderAsync()
            {
            var list = new List<SalesOrder>()
            {
                Entity = "John",
                Subsidiary = 1,
                Email = "john.netsuite@test.com",
                Location = 2; 
            };
            Console.WriteLine($"The SalesOrder is created for: {SalesOrder.Entity} {SalesOrder.Subsidiary.ToUpper()}");
            Console.ReadKey(); 
            }
             /* connection creating function
             -using TSTDRV account to create the sales order
             -first create the connection 
             -then send over the data for the SalesOrder
             */
            public static void createConnection()
            {
               //using admin information 
              // and suitetalk endpoint
                TODO connector information test
                     //URL https://tstdrv837235399.suitetalk.api.netsuite.com
                     try{
                        //public HttpRequest (string filename, string url, string queryString);
                        HttpRequest myRequest = new HttpRequest('NS1_SalesOrder.cs', url, null);
                     }catch(Error){
                     
                     }
            }
        }
 }
