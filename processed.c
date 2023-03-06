#include <stdio.h>


int nth_prime(int n) 
{ 
    int prime_number = 2; 
    int count = 1; 
  
    while (count < n) 
    { 
        prime_number++; 
        int i; 
        for (i = 2; i <= prime_number; i++) 
        { 
            if (prime_number % i == 0) 
                break; 
        } 
        if (i == prime_number) 
            count++; 
    } 
    return prime_number; 
}

int is_prime(int n) 
{ 
    // Corner cases 
    if (n <= 1)  return 0; 
    if (n <= 3)  return 1; 
  
    // This is checked so that we can skip  
    // middle five numbers in below loop 
    if (n%2 == 0 || n%3 == 0) return 0; 
  
    for (int i=5; i*i<=n; i=i+6) 
        if (n%i == 0 || n%(i+2) == 0) 
           return 0; 
  
    return 1; 
}
int main() {
    printf("%d", is_prime(4));

    return 0;
}