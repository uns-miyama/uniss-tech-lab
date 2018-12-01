//
//  ViewController.swift
//  iOS
//
//  Created by 藤木博志 on 2018/09/01.
//  Copyright © 2018年 藤木博志. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    @IBAction func goBack(_ segue:UIStoryboardSegue) {}
    
    @IBAction func goNext(_ sender:UIButton) {
        let next = storyboard!.instantiateViewController(withIdentifier: "nextView")
        self.present(next,animated: true, completion: nil)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

