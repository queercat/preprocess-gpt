# preprocess-gpt
Utilizing GPT as a preprocessor to mix language native code and high level pseudocode.

# Sample

Using text-davinci-003 I was able to turn

```c
#include <stdio.h>

/* implement the function in C int nth_prime(int n) which returns the nth prime number do not use headers */
/* implement the function in C int is_prime(int n) which returns if a number is prime do not use headers*/

void main() {
    printf("%d", is_prime(nth_prime(100)));

    return 0;
}
```

into

```c
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
    printf("%d", is_prime(nth_prime(100)));

    return 0;
}
```
