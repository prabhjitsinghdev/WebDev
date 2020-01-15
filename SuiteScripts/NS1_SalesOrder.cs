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
        * can work with webservices request 
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
        }
 }
